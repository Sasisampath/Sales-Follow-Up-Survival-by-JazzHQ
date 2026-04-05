import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

export type OutcomeFlash = "correct" | "incorrect" | null;

type Props = {
  outcomeFlash: OutcomeFlash;
  onComplete?: () => void;
};

export default function DecisionOutcomeFlash({
  outcomeFlash,
  onComplete,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!outcomeFlash) {
      return;
    }
    opacity.setValue(0);
    const anim = Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);
    anim.start(({ finished }) => {
      if (finished) {
        onComplete?.();
      }
    });
    return () => anim.stop();
  }, [outcomeFlash, opacity, onComplete]);

  if (!outcomeFlash) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.layer,
        {
          backgroundColor:
            outcomeFlash === "correct"
              ? "rgba(34, 197, 94, 0.55)"
              : "rgba(239, 68, 68, 0.52)",
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 45,
  },
});
