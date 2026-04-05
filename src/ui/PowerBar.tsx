import React from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  power: number;
  /** Visual cap for the bar fill (boss triggers at this value). */
  maxPower?: number;
};

export default function PowerBar({ power, maxPower = 20 }: Props) {
  const pct = Math.min(100, Math.max(0, (power / maxPower) * 100));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.45)",
    overflow: "hidden",
    minWidth: 140,
  },
  fill: {
    height: "100%",
    backgroundColor: "#4ADE80",
    borderRadius: 2,
  },
});
