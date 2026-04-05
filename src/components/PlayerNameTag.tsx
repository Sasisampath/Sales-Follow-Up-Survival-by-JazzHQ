import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  name: string;
  screenX: number;
  screenY: number;
  visible: boolean;
};

export default function PlayerNameTag({ name, screenX, screenY, visible }: Props) {
  if (!visible || !name.trim()) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          left: screenX,
          top: screenY,
        },
      ]}
    >
      <Text style={styles.text} numberOfLines={1}>
        {name.trim()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    transform: [{ translateX: -80 }, { translateY: -28 }],
    width: 160,
    alignItems: "center",
    zIndex: 60,
  },
  text: {
    fontFamily: "retro",
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "rgba(255,255,255,0.92)",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.15)",
  },
});
