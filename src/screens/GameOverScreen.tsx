import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Footer from "@/components/GameOver/Footer";

function GameOver({ ...props }) {
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
        <Text style={styles.heading}>Session ended</Text>
        <Text style={styles.subtitle}>
          Review your run and continue training when ready.
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
    gap: 12,
  },
  heading: {
    fontFamily: "retro",
    fontSize: 22,
    color: "#0f172a",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "System",
    fontSize: 15,
    color: "#334155",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
});
