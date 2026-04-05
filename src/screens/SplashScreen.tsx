import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onFinish: () => void;
  /** Auto-advance after this many ms (tap skips). */
  durationMs?: number;
};

export default function SplashScreen({ onFinish, durationMs = 2200 }: Props) {
  const { top, bottom } = useSafeAreaInsets();

  useEffect(() => {
    const t = setTimeout(onFinish, durationMs);
    return () => clearTimeout(t);
  }, [onFinish, durationMs]);

  return (
    <Pressable
      style={[
        styles.root,
        {
          paddingTop: Math.max(top, 24),
          paddingBottom: Math.max(bottom, 24),
        },
      ]}
      onPress={onFinish}
    >
      <View style={styles.center}>
        <Text style={styles.logo}>SALES FOLLOW-UP SURVIVAL</Text>
        <Text style={styles.tag}>Training simulator</Text>
      </View>
      <Text style={styles.footer}>by JazzHQ</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0f172a",
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logo: {
    fontFamily: "retro",
    fontSize: 22,
    lineHeight: 30,
    color: "#f8fafc",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  tag: {
    marginTop: 12,
    fontSize: 15,
    color: "#94a3b8",
  },
  footer: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
});
