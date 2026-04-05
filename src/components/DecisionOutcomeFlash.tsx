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
  visible: boolean;
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  powerDelta: number;
  onContinue: () => void;
};

export default function DecisionOutcomeFlash({
  visible,
  correct,
  correctAnswer,
  explanation,
  powerDelta,
  onContinue,
}: Props) {
  const { top, bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  if (!visible) {
    return null;
  }

  const cardW = Math.min(width - 32, 420);

  return (
    <View style={styles.fullScreen} pointerEvents="auto">
      <Pressable style={StyleSheet.absoluteFill} onPress={onContinue} />
      <View
        style={[
          styles.card,
          {
            width: cardW,
            marginTop: Math.max(top, 12),
            marginBottom: Math.max(bottom, 12),
          },
        ]}
        pointerEvents="auto"
      >
        <Text style={styles.title}>
          {correct ? "✅ Correct decision" : "❌ Not the best choice"}
        </Text>

        {!correct && (
          <Text style={styles.correctAnswer}>Best answer: {correctAnswer}</Text>
        )}

        {correct && (
          <Text style={styles.correctAnswerMuted}>{correctAnswer}</Text>
        )}

        <Text style={styles.explanation}>{explanation}</Text>

        <Text style={styles.power}>
          Power {powerDelta > 0 ? "+" : ""}
          {powerDelta}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue training"
          onPress={onContinue}
          style={({ pressed }) => [
            styles.continueBtn,
            pressed && styles.continueBtnPressed,
          ]}
        >
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.72)",
  },
  card: {
    backgroundColor: "#0f172af2",
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(56, 189, 248, 0.35)",
    gap: 12,
  },
  title: {
    fontFamily: "retro",
    fontSize: 20,
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 4,
  },
  correctAnswer: {
    fontSize: 16,
    color: "#22c55e",
    textAlign: "center",
    lineHeight: 22,
  },
  correctAnswerMuted: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  explanation: {
    fontSize: 15,
    color: "#e2e8f0",
    textAlign: "center",
    lineHeight: 22,
  },
  power: {
    fontFamily: "retro",
    fontSize: 20,
    color: "#38bdf8",
    textAlign: "center",
    marginTop: 4,
  },
  continueBtn: {
    marginTop: 8,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  continueBtnPressed: {
    backgroundColor: "#0284c7",
  },
  continueText: {
    fontFamily: "retro",
    fontSize: 16,
    color: "#fff",
  },
});
