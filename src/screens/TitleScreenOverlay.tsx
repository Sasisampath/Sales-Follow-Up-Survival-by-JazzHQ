import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type TrainingRole = "sales" | "marketing";

type Props = {
  selectedRole: TrainingRole;
  onSelectRole: (role: TrainingRole) => void;
  onStartMission: () => void;
};

export default function TitleScreenOverlay({
  selectedRole,
  onSelectRole,
  onStartMission,
}: Props) {
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
          SALES FOLLOW-UP SURVIVAL
        </Text>
        <Text style={styles.subtitle}>AI Decision Training Game</Text>

        <Text style={styles.sectionLabel}>Role</Text>
        <View style={[styles.roleRow, isNarrow && styles.roleRowNarrow]}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: selectedRole === "sales" }}
            onPress={() => onSelectRole("sales")}
            style={({ pressed }) => [
              styles.roleBtn,
              selectedRole === "sales" && styles.roleBtnSelected,
              pressed && styles.roleBtnPressed,
            ]}
          >
            <Text
              style={[
                styles.roleBtnText,
                selectedRole === "sales" && styles.roleBtnTextSelected,
              ]}
            >
              Sales
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: selectedRole === "marketing" }}
            onPress={() => onSelectRole("marketing")}
            style={({ pressed }) => [
              styles.roleBtn,
              selectedRole === "marketing" && styles.roleBtnSelected,
              pressed && styles.roleBtnPressed,
            ]}
          >
            <Text
              style={[
                styles.roleBtnText,
                selectedRole === "marketing" && styles.roleBtnTextSelected,
              ]}
            >
              Marketing
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start mission"
          onPress={onStartMission}
          style={({ pressed }) => [
            styles.startBtn,
            pressed && styles.startBtnPressed,
          ]}
        >
          <Text style={styles.startBtnText}>START MISSION</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>by JazzHQ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.94)",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
    gap: 20,
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
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: -8,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginTop: 8,
  },
  roleRow: {
    flexDirection: "row",
    gap: 12,
  },
  roleRowNarrow: {
    flexDirection: "column",
  },
  roleBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#334155",
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  roleBtnSelected: {
    borderColor: "#38bdf8",
    backgroundColor: "rgba(14, 165, 233, 0.2)",
  },
  roleBtnPressed: {
    opacity: 0.88,
  },
  roleBtnText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#cbd5e1",
  },
  roleBtnTextSelected: {
    color: "#e0f2fe",
  },
  startBtn: {
    marginTop: 12,
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
  footer: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    paddingBottom: 4,
  },
});
