import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  PLAYER_ROLES,
  formatRoleLabel,
  type PlayerRole,
} from "@/types/player";

type Props = {
  playerRole: PlayerRole;
  onSelectRole: (role: PlayerRole) => void;
  onContinue: () => void;
};

export default function RoleSelectScreen({
  playerRole,
  onSelectRole,
  onContinue,
}: Props) {
  const { top, bottom, left, right } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const narrow = width < 420;

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
        <Text style={styles.title}>Select role</Text>
        <View style={[styles.grid, narrow && styles.gridNarrow]}>
          {PLAYER_ROLES.map((role) => (
            <Pressable
              key={role}
              accessibilityRole="button"
              accessibilityState={{ selected: playerRole === role }}
              onPress={() => onSelectRole(role)}
              style={({ pressed }) => [
                styles.roleBtn,
                narrow && styles.roleBtnFull,
                playerRole === role && styles.roleBtnSelected,
                pressed && styles.roleBtnPressed,
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  playerRole === role && styles.roleTextSelected,
                ]}
              >
                {formatRoleLabel(role)}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onContinue}
          style={({ pressed }) => [styles.continue, pressed && styles.continuePressed]}
        >
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.97)",
    justifyContent: "center",
  },
  content: {
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
    gap: 20,
  },
  title: {
    fontFamily: "retro",
    fontSize: 22,
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  gridNarrow: {
    flexDirection: "column",
  },
  roleBtn: {
    minWidth: "44%",
    flexGrow: 1,
    maxWidth: "48%",
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#334155",
    backgroundColor: "rgba(30, 41, 59, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  roleBtnFull: {
    width: "100%",
    maxWidth: "100%",
    minWidth: "100%",
  },
  roleBtnSelected: {
    borderColor: "#38bdf8",
    backgroundColor: "rgba(14, 165, 233, 0.25)",
  },
  roleBtnPressed: {
    opacity: 0.9,
  },
  roleText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#cbd5e1",
  },
  roleTextSelected: {
    color: "#e0f2fe",
  },
  continue: {
    marginTop: 8,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  continuePressed: {
    backgroundColor: "#0284c7",
  },
  continueText: {
    fontFamily: "retro",
    fontSize: 17,
    color: "#fff",
  },
});
