import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Footer from "@/components/GameOver/Footer";

type Props = {
  power: number;
  correctAnswers: number;
  /** Current training tier derived from power (display + next goal). */
  trainingLevel: number;
  showSettings?: () => void;
  setGameState: (state: unknown) => void;
  navigation?: unknown;
  style?: object;
};

function GameOver({
  power,
  correctAnswers,
  trainingLevel,
  ...props
}: Props) {
  const { top, bottom, left, right } = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: top || 12, paddingBottom: bottom || 8 },
        props.style,
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Training Complete</Text>

        <Text style={styles.subtitle}>Power: {power}</Text>

        <Text style={styles.subtitle}>
          Correct decisions: {correctAnswers}
        </Text>

        <Text style={styles.subtitle}>
          Next goal: Reach Level {trainingLevel + 1}
        </Text>
      </View>

      <Footer
        style={{ paddingLeft: left || 4, paddingRight: right || 4 }}
        showSettings={props.showSettings}
        setGameState={props.setGameState}
        navigation={props.navigation}
      />
    </View>
  );
}

export default GameOver;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(135, 198, 255, 0.92)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  title: {
    fontFamily: "retro",
    fontSize: 24,
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "System",
    fontSize: 16,
    color: "#334155",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 340,
  },
});
