import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  moveLeft: () => void;
  moveForward: () => void;
  moveRight: () => void;
};

export default function TouchControlPanel({
  moveLeft,
  moveForward,
  moveRight,
}: Props) {
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(width * 0.94, 440);
  const btnMinH = Math.max(58, Math.round(width * 0.14));

  return (
    <View
      style={[styles.wrap, { paddingBottom: Math.max(bottom, 10) + 6 }]}
      pointerEvents="box-none"
    >
      <View style={[styles.panel, { width: panelWidth }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Move left"
          onPress={moveLeft}
          style={({ pressed }) => [
            styles.btn,
            { minHeight: btnMinH },
            pressed && styles.btnPressed,
          ]}
        >
          <Text style={styles.btnText}>LEFT</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Move forward"
          onPress={moveForward}
          style={({ pressed }) => [
            styles.btn,
            styles.btnPrimary,
            { minHeight: btnMinH },
            pressed && styles.btnPressed,
          ]}
        >
          <Text style={styles.btnText}>FORWARD</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Move right"
          onPress={moveRight}
          style={({ pressed }) => [
            styles.btn,
            { minHeight: btnMinH },
            pressed && styles.btnPressed,
          ]}
        >
          <Text style={styles.btnText}>RIGHT</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    zIndex: 22,
  },
  panel: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    ...(Platform.OS === "web"
      ? {
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }
      : {}),
  },
  btn: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  btnPrimary: {
    backgroundColor: "rgba(14, 165, 233, 0.35)",
    borderColor: "rgba(56, 189, 248, 0.55)",
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  btnText: {
    fontFamily: "retro",
    fontSize: 17,
    color: "#f8fafc",
    letterSpacing: 0.5,
  },
});
