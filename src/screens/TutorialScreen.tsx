import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  playerName: string;
  /**
   * When true, show STEP 1–3 walkthrough with highlighted mocks (first launch only).
   * Parent should pass `false` after `@SFU:tutorialComplete` is set.
   */
  isFirstLaunch: boolean;
  onStartTraining: () => void;
  onSkip: () => void;
};

function MockControlRow({ highlight }: { highlight: boolean }) {
  const { width } = useWindowDimensions();
  const h = Math.max(52, Math.round(width * 0.12));
  return (
    <View style={[styles.mockPanel, highlight && styles.mockHighlight]}>
      <View style={[styles.mockBtn, { minHeight: h }]}>
        <Text style={styles.mockBtnText}>LEFT</Text>
      </View>
      <View style={[styles.mockBtn, styles.mockBtnMid, { minHeight: h }]}>
        <Text style={styles.mockBtnText}>FORWARD</Text>
      </View>
      <View style={[styles.mockBtn, { minHeight: h }]}>
        <Text style={styles.mockBtnText}>RIGHT</Text>
      </View>
    </View>
  );
}

function MockVehicles() {
  return (
    <View style={[styles.mockCard, styles.mockHighlight]}>
      <Text style={styles.mockCardTitle}>Hazards</Text>
      <Text style={styles.mockCardBody}>
        Cars, trains, and water — time your moves and stay in safe lanes.
      </Text>
      <View style={styles.vehicleRow}>
        <View style={[styles.carDot, { backgroundColor: "#ef4444" }]} />
        <View style={[styles.carDot, { backgroundColor: "#f59e0b" }]} />
        <View style={[styles.carDot, { backgroundColor: "#3b82f6" }]} />
      </View>
    </View>
  );
}

function MockDecisionPreview() {
  return (
    <View style={[styles.mockDecision, styles.mockHighlight]}>
      <Text style={styles.mockDecisionTitle}>MISSION: Sample follow-up</Text>
      <Text style={styles.mockDecisionSub}>Choose best action</Text>
      <View style={styles.mockLanes}>
        {["A", "B", "C"].map((L) => (
          <View key={L} style={styles.mockLane}>
            <Text style={styles.mockLaneBadge}>{L}</Text>
            <Text style={styles.mockLaneTxt}>Option</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function MockPowerBar() {
  return (
    <View style={[styles.mockCard, styles.mockHighlight]}>
      <Text style={styles.mockCardTitle}>Confidence (power)</Text>
      <Text style={styles.mockCardBody}>
        Correct answers raise your confidence bar. Wrong picks cost you — build
        power to reach the boss encounter.
      </Text>
      <View style={styles.mockPowerTrack}>
        <View style={styles.mockPowerFill} />
      </View>
      <Text style={styles.mockPowerHint}>+5 on correct lane</Text>
    </View>
  );
}

function MockMissionComplete() {
  return (
    <View style={[styles.mockCard, styles.mockHighlight]}>
      <Text style={styles.mockCardTitle}>Missions & boss</Text>
      <Text style={styles.mockCardBody}>
        Each run is a mission: cross lanes, decide under pressure, and
        survive to the closing call. Finish the boss to complete a training
        cycle.
      </Text>
    </View>
  );
}

export default function TutorialScreen({
  playerName,
  isFirstLaunch,
  onStartTraining,
  onSkip,
}: Props) {
  const { top, bottom, left, right } = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  const firstName = playerName.trim().split(/\s+/)[0] || "there";

  if (!isFirstLaunch) {
    return (
      <View
        style={[
          styles.root,
          {
            paddingTop: Math.max(top, 16),
            paddingBottom: Math.max(bottom, 16),
            paddingLeft: Math.max(left, 16),
            paddingRight: Math.max(right, 16),
          },
        ]}
      >
        <View style={styles.compact}>
          <Text style={styles.compactTitle}>Tutorial</Text>
          <Text style={styles.bullet}>• Move forward / dodge with buttons</Text>
          <Text style={styles.bullet}>• Gold checkpoint row = decision coming — read the banner</Text>
          <Text style={styles.bullet}>• Avoid vehicles and hazards</Text>
          <Text style={styles.bullet}>• Answer missions correctly to gain power</Text>
          <Text style={styles.bullet}>• Complete the boss to finish a mission</Text>
          <View style={styles.dualRow}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.primaryBtnPressed,
              ]}
              onPress={onStartTraining}
            >
              <Text style={styles.primaryBtnText}>START TRAINING</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && styles.secondaryBtnPressed,
              ]}
              onPress={onSkip}
            >
              <Text style={styles.secondaryBtnText}>SKIP</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  const steps = [
    {
      k: 1,
      title: "STEP 1",
      body: "Move forward and side-to-side using the buttons (mobile) or keys (web).",
      extra: <MockControlRow highlight />,
    },
    {
      k: 2,
      title: "STEP 2",
      body: "Avoid vehicles, trains, and water — time each move.",
      extra: <MockVehicles />,
    },
    {
      k: 3,
      title: "STEP 3",
      body:
        "Watch for the gold checkpoint row ahead, then answer when the lanes unlock. Pick the best lane (A, B, or C).",
      extra: <MockDecisionPreview />,
    },
    {
      k: 4,
      title: "STEP 4",
      body: "Correct answers add power (confidence). Wrong answers set you back — manage risk like real follow-ups.",
      extra: <MockPowerBar />,
    },
    {
      k: 5,
      title: "STEP 5",
      body: "Stack good decisions, survive the road, and face the boss to complete a training run.",
      extra: <MockMissionComplete />,
    },
  ];

  if (step < 5) {
    const s = steps[step];
    return (
      <View
        style={[
          styles.root,
          {
            paddingTop: Math.max(top, 16),
            paddingBottom: Math.max(bottom, 16),
            paddingLeft: Math.max(left, 16),
            paddingRight: Math.max(right, 16),
          },
        ]}
      >
        <View style={styles.stepWrap}>
          <Text style={styles.stepTitle}>{s.title}</Text>
          <Text style={styles.stepBody}>{s.body}</Text>
          {s.extra}
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              styles.nextBtn,
              pressed && styles.primaryBtnPressed,
            ]}
            onPress={() => setStep((x) => x + 1)}
          >
            <Text style={styles.primaryBtnText}>Next</Text>
          </Pressable>
          <Pressable onPress={onSkip} style={styles.skipLink}>
            <Text style={styles.skipLinkText}>Skip tutorial</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: Math.max(top, 16),
          paddingBottom: Math.max(bottom, 16),
          paddingLeft: Math.max(left, 16),
          paddingRight: Math.max(right, 16),
        },
      ]}
    >
      <View style={styles.finalWrap}>
        <Text style={styles.welcome}>
          Welcome {firstName} 👋
        </Text>
        <Text style={styles.missionHead}>Mission</Text>
        <Text style={styles.bullet}>• Reply correctly to leads</Text>
        <Text style={styles.bullet}>• Avoid bad follow-ups</Text>
        <Text style={styles.bullet}>• Increase confidence score</Text>
        <Text style={styles.bullet}>• Defeat prospect boss</Text>
        <View style={styles.dualRow}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.primaryBtnPressed,
            ]}
            onPress={onStartTraining}
          >
            <Text style={styles.primaryBtnText}>START TRAINING</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && styles.secondaryBtnPressed,
            ]}
            onPress={onSkip}
          >
            <Text style={styles.secondaryBtnText}>SKIP</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    justifyContent: "center",
  },
  compact: {
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
    gap: 14,
  },
  compactTitle: {
    fontFamily: "retro",
    fontSize: 22,
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: "#cbd5e1",
    lineHeight: 24,
  },
  stepWrap: {
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
    gap: 16,
  },
  stepTitle: {
    fontFamily: "retro",
    fontSize: 22,
    color: "#38bdf8",
    textAlign: "center",
  },
  stepBody: {
    fontSize: 17,
    color: "#e2e8f0",
    textAlign: "center",
    lineHeight: 24,
  },
  nextBtn: {
    marginTop: 12,
  },
  skipLink: {
    alignSelf: "center",
    paddingVertical: 12,
  },
  skipLinkText: {
    color: "#94a3b8",
    fontSize: 15,
  },
  finalWrap: {
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
    gap: 12,
  },
  welcome: {
    fontFamily: "retro",
    fontSize: 24,
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 8,
  },
  missionHead: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 2,
    marginTop: 8,
  },
  mockHighlight: {
    borderWidth: 3,
    borderColor: "#38bdf8",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  mockPanel: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.35)",
    marginTop: 8,
  },
  mockBtn: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  mockBtnMid: {
    backgroundColor: "rgba(14, 165, 233, 0.3)",
    borderColor: "rgba(56, 189, 248, 0.5)",
  },
  mockBtnText: {
    fontFamily: "retro",
    fontSize: 14,
    color: "#f8fafc",
  },
  mockCard: {
    marginTop: 8,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "rgba(30, 41, 59, 0.9)",
  },
  mockCardTitle: {
    fontFamily: "retro",
    fontSize: 16,
    color: "#f8e84d",
    marginBottom: 8,
  },
  mockCardBody: {
    fontSize: 15,
    color: "#cbd5e1",
    lineHeight: 22,
  },
  vehicleRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    justifyContent: "center",
  },
  carDot: {
    width: 44,
    height: 28,
    borderRadius: 6,
  },
  mockDecision: {
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  mockDecisionTitle: {
    fontFamily: "retro",
    fontSize: 14,
    color: "#f8fafc",
    textAlign: "center",
  },
  mockDecisionSub: {
    fontSize: 15,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 10,
  },
  mockLanes: {
    flexDirection: "row",
    gap: 8,
  },
  mockLane: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  mockLaneBadge: {
    fontFamily: "retro",
    color: "#f8e84d",
    marginBottom: 4,
  },
  mockLaneTxt: {
    fontSize: 11,
    color: "#e2e8f0",
    textAlign: "center",
  },
  mockPowerTrack: {
    marginTop: 14,
    height: 14,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.35)",
    overflow: "hidden",
  },
  mockPowerFill: {
    width: "62%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#22c55e",
  },
  mockPowerHint: {
    marginTop: 8,
    fontSize: 13,
    color: "#86efac",
    textAlign: "center",
  },
  dualRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  primaryBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  primaryBtnPressed: {
    backgroundColor: "#0284c7",
  },
  primaryBtnText: {
    fontFamily: "retro",
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#475569",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnPressed: {
    opacity: 0.85,
  },
  secondaryBtnText: {
    fontFamily: "retro",
    fontSize: 16,
    color: "#cbd5e1",
  },
});
