import AsyncStorage from "@react-native-async-storage/async-storage";

import type { PlayerRole } from "@/types/player";

const KEYS = {
  playerName: "@SFU:playerName",
  playerRole: "@SFU:playerRole",
  tutorialComplete: "@SFU:tutorialComplete",
} as const;

export type SavedProfile = {
  playerName: string;
  playerRole: PlayerRole | null;
  tutorialComplete: boolean;
};

export async function loadProfile(): Promise<SavedProfile> {
  try {
    const [name, role, tut] = await Promise.all([
      AsyncStorage.getItem(KEYS.playerName),
      AsyncStorage.getItem(KEYS.playerRole),
      AsyncStorage.getItem(KEYS.tutorialComplete),
    ]);
    const validRoles: PlayerRole[] = [
      "sales",
      "marketing",
      "founder",
      "support",
    ];
    const r = role && validRoles.includes(role as PlayerRole)
      ? (role as PlayerRole)
      : null;
    return {
      playerName: name?.trim() || "",
      playerRole: r,
      tutorialComplete: tut === "1",
    };
  } catch {
    return { playerName: "", playerRole: null, tutorialComplete: false };
  }
}

export async function savePlayerName(name: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.playerName, name.trim());
}

export async function savePlayerRole(role: PlayerRole): Promise<void> {
  await AsyncStorage.setItem(KEYS.playerRole, role);
}

export async function markTutorialComplete(): Promise<void> {
  await AsyncStorage.setItem(KEYS.tutorialComplete, "1");
}
