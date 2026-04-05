import React from "react";
import { StyleSheet, Text, Platform, View } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";
import GameContext from "@/context/GameContext";
import PowerBar from "@/ui/PowerBar";

function generateTextShadow(width) {
  return Platform.select({
    web: {
      textShadow: `-${width}px 0px 0px #000, ${width}px 0px 0px #000, 0px -${width}px 0px #000, 0px ${width}px 0px #000`,
    },
    default: {},
  });
}
const labelShadow = generateTextShadow(2);
const valueShadow = generateTextShadow(3);

export default function Score({ gameOver, score, power, ...props }) {
  const { highscore = 0, setHighscore } = React.useContext(GameContext);

  React.useEffect(() => {
    if (gameOver) {
      if (score > highscore) {
        setHighscore(score);
      }
    }
  }, [gameOver]);

  const { top, left } = useSafeArea();

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        { top: Math.max(top, 16), left: Math.max(left, 8) },
      ]}
    >
      {typeof power === "number" && (
        <View style={styles.block}>
          <Text style={[styles.hudLabel, labelShadow]}>POWER</Text>
          <Text style={[styles.hudValue, valueShadow]}>{power}</Text>
          <PowerBar power={power} />
        </View>
      )}
      <View style={styles.block}>
        <Text style={[styles.hudLabel, labelShadow]}>MISSION</Text>
        <Text style={[styles.hudValue, valueShadow]}>{score}</Text>
      </View>
      <View style={styles.block}>
        <Text style={[styles.hudLabel, labelShadow]}>LEVEL</Text>
        <Text style={[styles.hudValue, valueShadow]}>{highscore}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    gap: 14,
  },
  block: {
    gap: 4,
  },
  hudLabel: {
    color: "rgba(232, 247, 255, 0.85)",
    fontFamily: "retro",
    fontSize: 11,
    letterSpacing: 1.2,
    backgroundColor: "transparent",
    textTransform: "uppercase",
  },
  hudValue: {
    color: "#f8fafc",
    fontFamily: "retro",
    fontSize: 28,
    backgroundColor: "transparent",
  },
});
