export type PlayerRole = "sales" | "marketing" | "founder" | "support";

export const PLAYER_ROLES: PlayerRole[] = [
  "sales",
  "marketing",
  "founder",
  "support",
];

export function formatRoleLabel(role: PlayerRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
