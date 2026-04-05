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
  /** Advances flow to name entry (same as “navigate to NameInputScreen”). */
  onNavigateToNameInput: () => void;
};

/**
 * Full-screen title overlay: game name, JazzHQ credit, START TRAINING.
 */
export default function TitleScreen({ onNavigateToNameInput }: Props) {
  const { top, bottom, left, right } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isNarrow = width < 400;

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: Math.max(top, 20),
          paddingBottom: Math.max(bottom, 20),
          paddingLeft: Math.max(left, 20),
          paddingRight: Math.max(right, 20),
        },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[styles.title, isNarrow && styles.titleNarrow]}
          accessibilityRole="header"
        >
          Sales Follow-Up Survival
        </Text>
        <Text style={styles.subtitle}>by JazzHQ</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start training"
          onPress={onNavigateToNameInput}
          style={({ pressed }) => [
            styles.startBtn,
            pressed && styles.startBtnPressed,
          ]}
        >
          <Text style={styles.startBtnText}>START TRAINING</Text>
        </Pressable>
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
  content: {
    justifyContent: "center",
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
    gap: 28,
  },
  title: {
    fontFamily: "retro",
    fontSize: 26,
    lineHeight: 32,
    color: "#f8fafc",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  titleNarrow: {
    fontSize: 21,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 17,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: -12,
  },
  startBtn: {
    marginTop: 8,
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  startBtnPressed: {
    backgroundColor: "#0284c7",
  },
  startBtnText: {
    fontFamily: "retro",
    fontSize: 18,
    color: "#fff",
    letterSpacing: 0.5,
  },
});
