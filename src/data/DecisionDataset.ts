export type SalesMission = {
  id: string;
  title: string;
  /** 0 = left lane (x=-1), 1 = center (x=0), 2 = right (x=1) */
  correctLane: 0 | 1 | 2;
  choices: [string, string, string];
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
    reward: 10,
  },
];
