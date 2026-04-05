import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  missionTitle: string;
  countdownStep: number;
};

/**
 * Top “checkpoint” strip: mission preview + countdown.
 * Bottom of the screen stays clear so LEFT / FORWARD / RIGHT still work during arming.
 */
export default function MissionCheckpointOverlay({
  missionTitle,
  countdownStep,
}: Props) {
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={[styles.root, { paddingTop: Math.max(top, 14) + 6 }]}
      pointerEvents="auto"
    >
      <Text style={styles.kicker}>MISSION AHEAD</Text>
      <Text style={styles.title} numberOfLines={3}>
        {missionTitle}
      </Text>
      <Text style={styles.hint}>Line up in a lane, then move forward</Text>
      <View style={styles.countRow}>
        <Text style={styles.countLabel}>Decision in</Text>
        <Text style={styles.countDigit}> {countdownStep} </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 0,
    zIndex: 40,
    backgroundColor: "rgba(15, 23, 42, 0.94)",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "rgba(248, 232, 77, 0.45)",
    gap: 8,
    alignItems: "center",
  },
  kicker: {
    fontFamily: "retro",
    fontSize: 13,
    color: "#f8e84d",
    letterSpacing: 3,
  },
  title: {
    fontFamily: "retro",
    fontSize: 17,
    color: "#f8fafc",
    textAlign: "center",
    lineHeight: 22,
  },
  hint: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
  },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  countLabel: {
    fontSize: 14,
    color: "#cbd5e1",
  },
  countDigit: {
    fontFamily: "retro",
    fontSize: 36,
    color: "#38bdf8",
  },
});
