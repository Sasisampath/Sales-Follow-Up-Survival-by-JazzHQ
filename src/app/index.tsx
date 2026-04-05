import { GLView } from "expo-gl";
import React, { Component } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  Vibration,
  View,
  Text,
  useColorScheme,
} from "react-native";

import GestureRecognizer, { swipeDirections } from "@/components/GestureView";
import PlayerNameTag from "@/components/PlayerNameTag";
import Score from "@/components/ScoreText";
import Engine from "@/GameEngine";
import State from "@/state";
import CharacterSelectScreen from "@/screens/CharacterSelectScreen";
import GameOverScreen from "@/screens/GameOverScreen";
import TouchControlPanel from "@/components/TouchControlPanel";
import DecisionMissionHud from "@/components/DecisionMissionHud";
import DecisionOutcomeFlash from "@/components/DecisionOutcomeFlash";
import MissionCheckpointOverlay from "@/components/MissionCheckpointOverlay";
import NameInputScreen from "@/screens/NameInputScreen";
import RoleSelectScreen from "@/screens/RoleSelectScreen";
import SplashScreen from "@/screens/SplashScreen";
import TitleScreen from "@/screens/TitleScreen";
import TutorialScreen from "@/screens/TutorialScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import GameContext from "@/context/GameContext";
import {
  loadProfile,
  markTutorialComplete,
  savePlayerName,
  savePlayerRole,
} from "@/persistence/profileStorage";
import type { PlayerRole } from "@/types/player";
import type { SalesMission } from "@/data/DecisionDataset";

const DEBUG_CAMERA_CONTROLS = false;

type IntroStep = "splash" | "title" | "name" | "role" | "tutorial" | null;

class Game extends Component<any, any> {
  engine!: any;
  _decisionLaneHighlightTimer?: ReturnType<typeof setTimeout>;
  _checkpointInterval?: ReturnType<typeof setInterval>;
  state = {
    ready: false,
    score: 0,
    power: 0,
    decisionAheadMission: null as SalesMission | null,
    decisionOnTileMission: null as SalesMission | null,
    /** none → arming (preview+countdown) → ready (lanes + forward allowed) */
    decisionCheckpointPhase: "none" as "none" | "arming" | "ready",
    countdownStep: 3,
    bossEncounter: false,
    viewKey: 0,
    gameState: State.Game.none,
    showSettings: false,
    showCharacterSelect: false,
    missionStarted: false,
    decisionPressedLane: null,
    decisionFeedback: null as null | {
      correct: boolean;
      correctAnswer: string;
      explanation: string;
      powerDelta: number;
    },
    correctDecisionsCount: 0,
    introStep: "splash" as IntroStep,
    playerName: "",
    playerRole: "sales" as PlayerRole,
    tutorialCompleteStorage: false,
    nametag: { x: 0, y: 0, visible: false },
  };

  transitionScreensValue = new Animated.Value(1);

  UNSAFE_componentWillReceiveProps(nextProps, nextState) {
    if (nextState.gameState && nextState.gameState !== this.state.gameState) {
      this.updateWithGameState(nextState.gameState);
    }
    if (this.engine && this.props.character !== nextProps.character) {
      this.engine._hero.setCharacter(nextProps.character);
    }
  }

  transitionToGamePlayingState = () => {
    Animated.timing(this.transitionScreensValue, {
      toValue: 0,
      useNativeDriver: true,
      duration: 200,
    }).start(({ finished }) => {
      this.engine.setupGame(this.props.character);
      this.engine.init();
      this.engine.setPlayerDisplayName(this.state.playerName);

      if (finished) {
        Animated.timing(this.transitionScreensValue, {
          toValue: 1,
          useNativeDriver: true,
          duration: 300,
        }).start();
      }
    });
  };

  updateWithGameState = (gameState) => {
    if (!gameState) throw new Error("gameState cannot be undefined");

    if (gameState === this.state.gameState) {
      return;
    }
    const lastState = this.state.gameState;

    this.setState({ gameState });
    this.engine.gameState = gameState;
    const { playing, gameOver, paused, none } = State.Game;
    switch (gameState) {
      case playing:
        if (lastState === paused) {
          this.engine.unpause();
        } else if (lastState !== none) {
          this.transitionToGamePlayingState();
        } else {
          this.engine._hero.stopIdle();
          this.engine.setPlayerDisplayName(this.state.playerName);
          this.onSwipe(swipeDirections.SWIPE_UP);
        }

        break;
      case gameOver:
        break;
      case paused:
        this.engine.pause();
        break;
      case none:
        this.setState({
          missionStarted: false,
          introStep: "title",
        });
        this.newScore();
        break;
      default:
        break;
    }
  };

  componentWillUnmount() {
    cancelAnimationFrame(this.engine.raf);
    if (this._decisionLaneHighlightTimer) {
      clearTimeout(this._decisionLaneHighlightTimer);
    }
    if (this._checkpointInterval) {
      clearInterval(this._checkpointInterval);
    }
  }

  missionForHud = () => {
    if (this.state.decisionCheckpointPhase !== "ready") {
      return null;
    }
    return this.state.decisionOnTileMission ?? this.state.decisionAheadMission;
  };

  _beginMissionCheckpoint = () => {
    if (this._checkpointInterval) {
      clearInterval(this._checkpointInterval);
    }
    this.engine.setDecisionCheckpointClear(false);
    this.setState({
      decisionCheckpointPhase: "arming",
      countdownStep: 3,
    });
    let step = 3;
    this._checkpointInterval = setInterval(() => {
      step -= 1;
      if (step <= 0) {
        if (this._checkpointInterval) {
          clearInterval(this._checkpointInterval);
          this._checkpointInterval = undefined;
        }
        this.setState({
          decisionCheckpointPhase: "ready",
          countdownStep: 0,
        });
        this.engine.setDecisionCheckpointClear(true);
      } else {
        this.setState({ countdownStep: step });
      }
    }, 650);
  };

  componentDidUpdate(_prevProps: unknown, prevState: any) {
    if (this.state.gameState !== State.Game.playing) {
      return;
    }
    const a = this.state.decisionAheadMission;
    const pa = prevState.decisionAheadMission;
    const onTile = this.state.decisionOnTileMission;
    const phase = this.state.decisionCheckpointPhase;
    if (
      a &&
      !onTile &&
      (!pa || pa.id !== a.id) &&
      phase !== "arming" &&
      phase !== "ready"
    ) {
      this._beginMissionCheckpoint();
    }
  }

  async componentDidMount() {
    Dimensions.addEventListener("change", this.onScreenResize);
    try {
      const p = await loadProfile();
      this.setState({
        playerName: p.playerName,
        playerRole: p.playerRole || "sales",
        tutorialCompleteStorage: p.tutorialComplete,
      });
    } catch {
      /* ignore */
    }
  }

  onScreenResize = () => {
    this.engine.updateScale();
  };

  UNSAFE_componentWillMount() {
    this.engine = new Engine();
    this.engine.onUpdateScore = (position) => {
      if (this.state.score < position) {
        this.setState({ score: position });
      }
    };
    this.engine.onGameInit = () => {
      if (this._checkpointInterval) {
        clearInterval(this._checkpointInterval);
        this._checkpointInterval = undefined;
      }
      this.engine.setDecisionCheckpointClear(false);
      this.setState({
        score: 0,
        power: 0,
        bossEncounter: false,
        decisionAheadMission: null,
        decisionOnTileMission: null,
        decisionCheckpointPhase: "none",
        countdownStep: 3,
        decisionPressedLane: null,
        decisionFeedback: null,
        correctDecisionsCount: 0,
      });
    };
    this.engine.onPowerChange = (power) => {
      this.setState({ power });
    };
    this.engine.onDecisionMissionContext = (ctx) => {
      this.setState({
        decisionAheadMission: ctx.ahead,
        decisionOnTileMission: ctx.onTile,
        decisionPressedLane: null,
        ...(!ctx.ahead && !ctx.onTile
          ? {
              decisionCheckpointPhase: "none" as const,
              countdownStep: 3,
            }
          : {}),
        ...(ctx.ahead || ctx.onTile ? { decisionFeedback: null } : {}),
      });
    };
    this.engine.onDecisionOutcome = (result) => {
      this.setState((prev) => ({
        decisionFeedback: {
          correct: result.correct,
          correctAnswer: result.correctAnswer,
          explanation: result.explanation,
          powerDelta: result.powerDelta,
        },
        correctDecisionsCount: result.correct
          ? prev.correctDecisionsCount + 1
          : prev.correctDecisionsCount,
      }));
    };
    this.engine.onBossEncounter = () => {
      this.setState({ bossEncounter: true });
    };
    this.engine._isGameStateEnded = () => {
      return this.state.gameState !== State.Game.playing;
    };
    this.engine.onGameReady = () => this.setState({ ready: true });
    this.engine.onGameEnded = () => {
      this.setState({ gameState: State.Game.gameOver });
    };
    this.engine.onNametagScreenPosition = ({ x, y, visible }) => {
      this.setState({ nametag: { x, y, visible } });
    };
    this.engine.setupGame(this.props.character);
    this.engine.init();
  }

  newScore = () => {
    Vibration.cancel();
    this.setState({ score: 0 });
    this.engine.init();
  };

  onSwipe = (gestureName) => {
    if (this.state.decisionFeedback) {
      return;
    }
    this.engine.moveWithDirection(gestureName);
  };

  handleStartGesture = () => {
    if (this.state.decisionFeedback) {
      return;
    }
    this.engine.beginMoveWithDirection();
  };

  /** GL + HUD visible only after onboarding starts the mission. */
  gameplayVisible = () => this.state.missionStarted;

  moveLeft = () => {
    if (this.state.decisionFeedback) {
      return;
    }
    if (
      !this.engine ||
      this.state.gameState !== State.Game.playing ||
      !this.gameplayVisible()
    ) {
      return;
    }
    this.engine.beginMoveWithDirection();
    this.onSwipe(swipeDirections.SWIPE_LEFT);
  };

  moveForward = () => {
    if (this.state.decisionFeedback) {
      return;
    }
    if (
      !this.engine ||
      this.state.gameState !== State.Game.playing ||
      !this.gameplayVisible()
    ) {
      return;
    }
    this.engine.beginMoveWithDirection();
    this.onSwipe(swipeDirections.SWIPE_UP);
  };

  moveRight = () => {
    if (this.state.decisionFeedback) {
      return;
    }
    if (
      !this.engine ||
      this.state.gameState !== State.Game.playing ||
      !this.gameplayVisible()
    ) {
      return;
    }
    this.engine.beginMoveWithDirection();
    this.onSwipe(swipeDirections.SWIPE_RIGHT);
  };

  showTouchControls = () =>
    Platform.OS !== "web" &&
    this.state.gameState === State.Game.playing &&
    this.gameplayVisible() &&
    !this.missionForHud() &&
    !this.state.decisionFeedback;

  handleSplashFinish = () => {
    this.setState({ introStep: "title" });
  };

  /** START TRAINING on title → always name entry (prefilled from storage). */
  handleTitleStartTraining = async () => {
    const p = await loadProfile();
    this.setState({
      introStep: "name",
      playerName: p.playerName || this.state.playerName,
      playerRole: p.playerRole || this.state.playerRole,
      tutorialCompleteStorage: p.tutorialComplete,
    });
  };

  handleNameContinue = async (name: string) => {
    await savePlayerName(name);
    this.setState({ playerName: name, introStep: "role" });
  };

  handleRoleContinue = async () => {
    await savePlayerRole(this.state.playerRole);
    const p = await loadProfile();
    if (!p.tutorialComplete) {
      this.setState({ introStep: "tutorial" });
    } else {
      this.finishOnboardingAndStart();
    }
  };

  finishOnboardingAndStart = async () => {
    await markTutorialComplete();
    this.engine.setPlayerDisplayName(this.state.playerName);
    this.setState(
      {
        tutorialCompleteStorage: true,
        introStep: null,
        missionStarted: true,
      },
      () => {
        this.updateWithGameState(State.Game.playing);
      }
    );
  };

  handleTutorialStartOrSkip = () => {
    this.finishOnboardingAndStart();
  };

  dismissDecisionFeedback = () => {
    const wrong = this.state.decisionFeedback && !this.state.decisionFeedback.correct;
    this.setState({ decisionFeedback: null }, () => {
      if (wrong) {
        this.engine.resolveDecisionPenaltyAfterFeedback();
      }
    });
  };

  handleDecisionLanePress = (laneIndex) => {
    if (!this.engine || this.engine._hero.moving) {
      return;
    }
    this.setState({ decisionPressedLane: laneIndex });
    if (this._decisionLaneHighlightTimer) {
      clearTimeout(this._decisionLaneHighlightTimer);
    }
    this._decisionLaneHighlightTimer = setTimeout(() => {
      this.setState({ decisionPressedLane: null });
      this._decisionLaneHighlightTimer = null;
    }, 300);
    this.engine.submitDecisionLaneChoice(laneIndex);
  };

  renderGame = () => {
    if (!this.state.ready) return;

    return (
      <GestureView
        pointerEvents={DEBUG_CAMERA_CONTROLS ? "none" : undefined}
        onStartGesture={this.handleStartGesture}
        onSwipe={this.onSwipe}
        keyboardEnabled={
          !this.state.decisionFeedback &&
          (Platform.OS === "web" ? !this.showTouchControls() : true)
        }
      >
        <GLView
          style={{ flex: 1, height: "100%", overflow: "hidden" }}
          onContextCreate={this.engine._onGLContextCreate}
        />
      </GestureView>
    );
  };

  renderGameOver = () => {
    if (this.state.gameState !== State.Game.gameOver) {
      return null;
    }

    return (
      <View style={StyleSheet.absoluteFillObject}>
        <GameOverScreen
          power={this.state.power}
          correctAnswers={this.state.correctDecisionsCount}
          trainingLevel={Math.max(1, Math.floor(this.state.power / 10) + 1)}
          showSettings={() => {
            this.setState({ showSettings: true });
          }}
          setGameState={(state) => {
            this.updateWithGameState(state);
          }}
        />
      </View>
    );
  };

  renderSettingsScreen() {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <SettingsScreen
          goBack={() => this.setState({ showSettings: false })}
          setCharacter={this.props.setCharacter}
        />
      </View>
    );
  }

  renderCharacterSelectScreen() {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <CharacterSelectScreen
          navigation={{
            goBack: () => this.setState({ showCharacterSelect: false }),
          }}
          setCharacter={this.props.setCharacter}
        />
      </View>
    );
  }

  renderIntroOverlay() {
    const { introStep } = this.state;
    if (introStep === "splash") {
      return <SplashScreen onFinish={this.handleSplashFinish} />;
    }
    if (introStep === "title") {
      return (
        <TitleScreen onNavigateToNameInput={this.handleTitleStartTraining} />
      );
    }
    if (introStep === "name") {
      return (
        <NameInputScreen
          initialName={this.state.playerName}
          onContinue={this.handleNameContinue}
        />
      );
    }
    if (introStep === "role") {
      return (
        <RoleSelectScreen
          playerRole={this.state.playerRole}
          onSelectRole={(playerRole) => this.setState({ playerRole })}
          onContinue={this.handleRoleContinue}
        />
      );
    }
    if (introStep === "tutorial") {
      return (
        <TutorialScreen
          playerName={this.state.playerName}
          isFirstLaunch={!this.state.tutorialCompleteStorage}
          onStartTraining={this.handleTutorialStartOrSkip}
          onSkip={this.handleTutorialStartOrSkip}
        />
      );
    }
    return null;
  }

  render() {
    const { isPaused } = this.props;
    const dimGame = !this.gameplayVisible();
    const hudMission = this.missionForHud();

    return (
      <View
        pointerEvents="box-none"
        style={[
          StyleSheet.absoluteFill,
          { flex: 1, backgroundColor: "#87C6FF" },
          Platform.select({
            web: { position: "fixed" },
            default: { position: "absolute" },
          }),
          this.props.style,
        ]}
      >
        <Animated.View
          style={{
            flex: 1,
            opacity: dimGame ? 0 : this.transitionScreensValue,
          }}
          pointerEvents={dimGame ? "none" : "auto"}
        >
          {this.renderGame()}
        </Animated.View>
        {!dimGame && (
          <Score
            score={this.state.score}
            power={this.state.power}
            gameOver={this.state.gameState === State.Game.gameOver}
          />
        )}
        {this.state.gameState === State.Game.playing &&
          this.state.decisionCheckpointPhase === "arming" &&
          this.state.decisionAheadMission && (
            <MissionCheckpointOverlay
              missionTitle={this.state.decisionAheadMission.title}
              countdownStep={this.state.countdownStep}
            />
          )}
        {hudMission && this.state.gameState === State.Game.playing && (
          <DecisionMissionHud
            title={hudMission.title}
            choices={hudMission.choices}
            onLanePress={this.handleDecisionLanePress}
            pressedLaneIndex={this.state.decisionPressedLane}
            onEndSession={() => this.engine.gameOver()}
          />
        )}
        {this.state.gameState === State.Game.playing &&
          this.state.decisionFeedback && (
            <DecisionOutcomeFlash
              visible
              correct={this.state.decisionFeedback.correct}
              correctAnswer={this.state.decisionFeedback.correctAnswer}
              explanation={this.state.decisionFeedback.explanation}
              powerDelta={this.state.decisionFeedback.powerDelta}
              onContinue={this.dismissDecisionFeedback}
            />
          )}
        {this.state.bossEncounter &&
          this.state.gameState === State.Game.playing && (
            <View style={styles.bossBanner} pointerEvents="none">
              <Text style={styles.bossText}>BOSS: CLOSING CALL</Text>
            </View>
          )}
        {this.showTouchControls() && (
          <TouchControlPanel
            moveLeft={this.moveLeft}
            moveForward={this.moveForward}
            moveRight={this.moveRight}
          />
        )}
        {this.state.gameState === State.Game.playing &&
          this.gameplayVisible() &&
          !!this.state.playerName.trim() && (
            <PlayerNameTag
              name={this.state.playerName}
              screenX={this.state.nametag.x}
              screenY={this.state.nametag.y}
              visible={this.state.nametag.visible}
            />
          )}
        {this.renderGameOver()}

        {this.state.introStep != null && (
          <View style={StyleSheet.absoluteFillObject} pointerEvents="auto">
            {this.renderIntroOverlay()}
          </View>
        )}

        {this.state.showSettings && this.renderSettingsScreen()}

        {this.state.showCharacterSelect && this.renderCharacterSelectScreen()}

        {isPaused && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "rgba(105, 201, 230, 0.8)",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bossBanner: {
    position: "absolute",
    top: 120,
    left: 16,
    right: 16,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "rgba(180, 40, 40, 0.92)",
    alignItems: "center",
  },
  bossText: {
    color: "#fff",
    fontFamily: "retro",
    fontSize: 22,
    textAlign: "center",
  },
});

const GestureView = ({
  onStartGesture,
  onSwipe,
  keyboardEnabled,
  ...props
}) => {
  const config = {
    velocityThreshold: 0.2,
    directionalOffsetThreshold: 80,
  };

  return (
    <GestureRecognizer
      keyboardEnabled={keyboardEnabled}
      onResponderGrant={() => {
        onStartGesture();
      }}
      onSwipe={(direction) => {
        onSwipe(direction);
      }}
      config={config}
      onTap={() => {
        onSwipe(swipeDirections.SWIPE_UP);
      }}
      style={{ flex: 1 }}
      {...props}
    />
  );
};

function GameScreen(props) {
  const scheme = useColorScheme();
  const { character, setCharacter } = React.useContext(GameContext);

  return (
    <Game
      {...props}
      character={character}
      setCharacter={setCharacter}
      isDarkMode={scheme === "dark"}
    />
  );
}

export default GameScreen;
