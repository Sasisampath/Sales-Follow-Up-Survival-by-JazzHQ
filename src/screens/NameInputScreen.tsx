import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  initialName: string;
  /** Parent should set `playerName` from the trimmed string. */
  onContinue: (name: string) => void;
};

export default function NameInputScreen({ initialName, onContinue }: Props) {
  /** Local field mirrors input; parent owns `playerName` after Continue. */
  const [name, setName] = useState(initialName);
  const { top, bottom, left, right } = useSafeAreaInsets();
  const trimmed = name.trim();
  const canContinue = trimmed.length > 0;

  return (
    <KeyboardAvoidingView
      style={[
        styles.root,
        {
          paddingTop: Math.max(top, 20),
          paddingBottom: Math.max(bottom, 20),
          paddingLeft: Math.max(left, 20),
          paddingRight: Math.max(right, 20),
        },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Enter your name</Text>
        <Text style={styles.hint}>This appears above your character.</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="#64748b"
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={24}
          returnKeyType="done"
          onSubmitEditing={() => canContinue && onContinue(trimmed)}
        />
        <Pressable
          accessibilityRole="button"
          disabled={!canContinue}
          onPress={() => canContinue && onContinue(trimmed)}
          style={({ pressed }) => [
            styles.btn,
            !canContinue && styles.btnDisabled,
            pressed && canContinue && styles.btnPressed,
          ]}
        >
          <Text style={styles.btnText}>Continue</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.97)",
    justifyContent: "center",
  },
  content: {
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
    gap: 16,
  },
  title: {
    fontFamily: "retro",
    fontSize: 22,
    color: "#f8fafc",
    textAlign: "center",
  },
  hint: {
    fontSize: 15,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#334155",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 18,
    color: "#f8fafc",
    backgroundColor: "rgba(30, 41, 59, 0.9)",
  },
  btn: {
    marginTop: 12,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnPressed: {
    backgroundColor: "#0284c7",
  },
  btnText: {
    fontFamily: "retro",
    fontSize: 17,
    color: "#fff",
  },
});
