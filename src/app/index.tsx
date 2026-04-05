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
import Score from "@/components/ScoreText";
import Engine from "@/GameEngine";
import State from "@/state";
import CharacterSelectScreen from "@/screens/CharacterSelectScreen";
import GameOverScreen from "@/screens/GameOverScreen";
import DecisionMissionHud from "@/components/DecisionMissionHud";
import DecisionOutcomeFlash from "@/components/DecisionOutcomeFlash";
import TitleScreenOverlay, {
  type TrainingRole,
} from "@/screens/TitleScreenOverlay";
import SettingsScreen from "@/screens/SettingsScreen";
import GameContext from "@/context/GameContext";

const DEBUG_CAMERA_CONTROLS = false;

class Game extends Component {
  /// Reserve State for UI related updates...
  state = {
    ready: false,
    score: 0,
    power: 0,
    decisionMission: null,
    bossEncounter: false,
    viewKey: 0,
    gameState: State.Game.none,
    showSettings: false,
    showCharacterSelect: false,
    /** Training role chosen on title screen */
    selectedRole: "sales" as TrainingRole,
    /** Gameplay GL scene hidden until user taps START MISSION */
    missionStarted: false,
    decisionPressedLane: null,
    decisionOutcomeFlash: null,
    // gameState: State.Game.gameOver
  };

  transitionScreensValue = new Animated.Value(1);

  UNSAFE_componentWillReceiveProps(nextProps, nextState) {
    if (nextState.gameState && nextState.gameState !== this.state.gameState) {
      this.updateWithGameState(nextState.gameState, this.state.gameState);
    }
    if (this.engine && nextProps.character !== this.props.character) {
      this.engine._hero.setCharacter(nextProps.character);
    }
  }

  transitionToGamePlayingState = () => {
    Animated.timing(this.transitionScreensValue, {
      toValue: 0,
      useNativeDriver: true,
      duration: 200,
      onComplete: ({ finished }) => {
        this.engine.setupGame(this.props.character);
        this.engine.init();

        if (finished) {
          Animated.timing(this.transitionScreensValue, {
            toValue: 1,
            useNativeDriver: true,
            duration: 300,
          }).start();
        }
      },
    }).start();
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
          // Coming straight from the menu.
          this.engine._hero.stopIdle();
          this.onSwipe(swipeDirections.SWIPE_UP);
        }

        break;
      case gameOver:
        break;
      case paused:
        this.engine.pause();
        break;
      case none:
        this.setState({ missionStarted: false });
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
    // Dimensions.removeEventListener("change", this.onScreenResize);
  }

  async componentDidMount() {
    // AudioManager.sounds.bg_music.setVolumeAsync(0.05);
    // await AudioManager.playAsync(
    //   AudioManager.sounds.bg_music, true
    // );

    Dimensions.addEventListener("change", this.onScreenResize);
  }

  onScreenResize = ({ window }) => {
    this.engine.updateScale();
  };

  UNSAFE_componentWillMount() {
    this.engine = new Engine();
    // this.engine.hideShadows = this.hideShadows;
    this.engine.onUpdateScore = (position) => {
      if (this.state.score < position) {
        this.setState({ score: position });
      }
    };
    this.engine.onGameInit = () => {
      this.setState({
        score: 0,
        power: 0,
        bossEncounter: false,
        decisionMission: null,
        decisionPressedLane: null,
        decisionOutcomeFlash: null,
      });
    };
    this.engine.onPowerChange = (power) => {
      this.setState({ power });
    };
    this.engine.onDecisionMission = (mission) => {
      this.setState({
        decisionMission: mission,
        decisionPressedLane: null,
        ...(mission ? { decisionOutcomeFlash: null } : {}),
      });
    };
    this.engine.onDecisionOutcome = (correct) => {
      this.setState({
        decisionOutcomeFlash: correct ? "correct" : "incorrect",
      });
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
      // this.props.navigation.navigate('GameOver')
    };
    this.engine.setupGame(this.props.character);
    this.engine.init();
  }

  newScore = () => {
    Vibration.cancel();
    // this.props.setGameState(State.Game.playing);
    this.setState({ score: 0 });
    this.engine.init();
  };

  onSwipe = (gestureName) => this.engine.moveWithDirection(gestureName);

  showTitleOverlay = () =>
    this.state.gameState === State.Game.none && !this.state.missionStarted;

  startMission = () => {
    this.setState({ missionStarted: true }, () => {
      this.updateWithGameState(State.Game.playing);
    });
  };

  handleDecisionOutcomeFlashEnd = () => {
    this.setState({ decisionOutcomeFlash: null });
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
        onStartGesture={this.engine.beginMoveWithDirection}
        onSwipe={this.onSwipe}
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

  render() {
    const { isDarkMode, isPaused } = this.props;

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
            opacity: this.showTitleOverlay() ? 0 : this.transitionScreensValue,
          }}
          pointerEvents={this.showTitleOverlay() ? "none" : "auto"}
        >
          {this.renderGame()}
        </Animated.View>
        {!this.showTitleOverlay() && (
          <Score
            score={this.state.score}
            power={this.state.power}
            gameOver={this.state.gameState === State.Game.gameOver}
          />
        )}
        {this.state.gameState === State.Game.playing && (
          <DecisionOutcomeFlash
            outcomeFlash={this.state.decisionOutcomeFlash}
            onComplete={this.handleDecisionOutcomeFlashEnd}
          />
        )}
        {this.state.decisionMission &&
          this.state.gameState === State.Game.playing && (
            <DecisionMissionHud
              title={this.state.decisionMission.title}
              choices={this.state.decisionMission.choices}
              onLanePress={this.handleDecisionLanePress}
              pressedLaneIndex={this.state.decisionPressedLane}
            />
          )}
        {this.state.bossEncounter &&
          this.state.gameState === State.Game.playing && (
            <View style={styles.bossBanner} pointerEvents="none">
              <Text style={styles.bossText}>BOSS: CLOSING CALL</Text>
            </View>
          )}
        {this.renderGameOver()}

        {this.showTitleOverlay() && (
          <View style={StyleSheet.absoluteFillObject} pointerEvents="auto">
            <TitleScreenOverlay
              selectedRole={this.state.selectedRole}
              onSelectRole={(role) => this.setState({ selectedRole: role })}
              onStartMission={this.startMission}
            />
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

const GestureView = ({ onStartGesture, onSwipe, ...props }) => {
  const config = {
    velocityThreshold: 0.2,
    directionalOffsetThreshold: 80,
  };

  return (
    <GestureRecognizer
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
