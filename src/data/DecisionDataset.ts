export type SalesMission = {
  id: string;
  title: string;
  /** 0 = left lane (x=-1), 1 = center (x=0), 2 = right (x=1) */
  correctLane: 0 | 1 | 2;
  choices: [string, string, string];
  /** Short coaching copy shown after the player answers */
  explanation: string;
  reward: number;
};

export const FOLLOWUP_MISSIONS: SalesMission[] = [
  {
    id: "followup_intro",
    title: "Reply to Lead Follow-Up",
    correctLane: 1,
    choices: [
      "Personalize intro",
      "Generic greeting",
      "Skip intro",
    ],
    explanation:
      "Use context from their last touch (role, company, prior reply) so the follow-up feels human — not a blast template.",
    reward: 15,
  },
  {
    id: "timing_touch",
    title: "When to ping again",
    correctLane: 0,
    choices: [
      "Wait for their timeline",
      "Bump every 2 hours",
      "Never follow up",
    ],
    explanation:
      "Respect how they said they want to be contacted. Cadence should match their urgency, not your anxiety.",
    reward: 12,
  },
  {
    id: "objection_price",
    title: "Price objection",
    correctLane: 2,
    choices: [
      "Drop price immediately",
      "Ignore the objection",
      "Reframe value & next step",
    ],
    explanation:
      "Acknowledge budget, tie to outcomes, and propose a concrete next step (trial, scope, pilot) instead of racing to discount.",
    reward: 10,
  },
];
