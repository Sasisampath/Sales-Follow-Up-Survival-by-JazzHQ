import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title: string;
  choices: readonly [string, string, string];
  onLanePress: (laneIndex: 0 | 1 | 2) => void;
  /** Brief touch feedback on the lane the player chose */
  pressedLaneIndex: number | null;
};

const LANE_LABELS = ["A", "B", "C"] as const;

export default function DecisionMissionHud({
  title,
  choices,
  onLanePress,
  pressedLaneIndex,
}: Props) {
  const { top, bottom } = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const laneMinHeight = Math.max(96, Math.round(height * 0.14));

  return (
    <View style={styles.root} pointerEvents="auto">
      <View
        style={[styles.header, { paddingTop: Math.max(top, 12) + 8 }]}
        pointerEvents="none"
      >
        <Text style={styles.missionLine} numberOfLines={4}>
          <Text style={styles.missionPrefix}>MISSION: </Text>
          <Text style={styles.missionTitle}>{title}</Text>
        </Text>
        <Text style={styles.subtitle}>Choose best action</Text>
      </View>

      <View
        style={[styles.laneDock, { paddingBottom: Math.max(bottom, 16) + 12 }]}
      >
        <View style={styles.laneRow}>
          {choices.map((label, i) => {
            const idx = i as 0 | 1 | 2;
            const pressed = pressedLaneIndex === i;
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`Lane ${LANE_LABELS[i]}: ${label}`}
                onPress={() => onLanePress(idx)}
                style={({ pressed: p }) => [
                  styles.laneBtn,
                  { minHeight: laneMinHeight },
                  pressed && styles.laneBtnSelected,
                  p && styles.laneBtnPressed,
                ]}
              >
                <Text style={styles.laneBadge}>{LANE_LABELS[i]}</Text>
                <Text style={styles.laneLabel} numberOfLines={4}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    zIndex: 25,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 6,
  },
  missionLine: {
    textAlign: "center",
    paddingHorizontal: 8,
  },
  missionPrefix: {
    fontFamily: "retro",
    fontSize: 15,
    color: "rgba(248, 250, 252, 0.8)",
    letterSpacing: 1,
  },
  missionTitle: {
    fontFamily: "retro",
    fontSize: 18,
    lineHeight: 24,
    color: "#f8fafc",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "600",
    color: "#cbd5e1",
    textAlign: "center",
  },
  laneDock: {
    paddingHorizontal: 10,
  },
  laneRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "stretch",
  },
  laneBtn: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "rgba(148, 163, 184, 0.45)",
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    paddingVertical: 14,
    paddingHorizontal: 8,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
  },
  laneBtnSelected: {
    borderColor: "#38bdf8",
    backgroundColor: "rgba(14, 165, 233, 0.35)",
  },
  laneBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  laneBadge: {
    fontFamily: "retro",
    fontSize: 18,
    color: "#f8e84d",
  },
  laneLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e2e8f0",
    textAlign: "center",
    lineHeight: 19,
  },
});
