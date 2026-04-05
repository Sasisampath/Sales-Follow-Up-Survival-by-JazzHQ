import {
  FOLLOWUP_MISSIONS,
  type SalesMission,
} from "@/data/DecisionDataset";

/** World X positions for the three playable lanes (left → right). */
export const DECISION_LANE_X = [-1, 0, 1] as const;

const LANE_LETTERS = ["A", "B", "C"] as const;

export type DecisionLaneResult = {
  correct: boolean;
  /** Best lane label + choice text, e.g. "B — Personalize intro" */
  correctAnswer: string;
  explanation: string;
  powerDelta: number;
};

export default class MissionEngine {
  private missions: SalesMission[];
  private index = 0;

  constructor(missions: SalesMission[] = FOLLOWUP_MISSIONS) {
    this.missions = missions;
  }

  reset() {
    this.index = 0;
  }

  hasNext(): boolean {
    return this.missions.length > 0;
  }

  /** Next mission for a new decision row (cycles). */
  nextDecisionRow(): SalesMission | null {
    if (!this.hasNext()) {
      return null;
    }
    const mission = this.missions[this.index % this.missions.length];
    this.index++;
    return mission;
  }

  /** Map hero world X to lane index 0..2, or null if not on a decision lane. */
  laneIndexFromX(x: number): number | null {
    const rx = Math.round(x);
    const idx = DECISION_LANE_X.indexOf(
      rx as (typeof DECISION_LANE_X)[number]
    );
    return idx >= 0 ? idx : null;
  }

  private formatCorrectAnswer(mission: SalesMission): string {
    const i = mission.correctLane;
    const letter = LANE_LETTERS[i];
    const label = mission.choices[i];
    return `${letter} — ${label}`;
  }

  validatePlayerLane(
    mission: SalesMission,
    playerX: number
  ): DecisionLaneResult {
    const correctAnswer = this.formatCorrectAnswer(mission);
    const explanation = mission.explanation;
    const lane = this.laneIndexFromX(playerX);

    if (lane === null) {
      return {
        correct: false,
        correctAnswer,
        explanation,
        powerDelta: -1,
      };
    }
    if (lane !== mission.correctLane) {
      return {
        correct: false,
        correctAnswer,
        explanation,
        powerDelta: -1,
      };
    }
    return {
      correct: true,
      correctAnswer,
      explanation,
      powerDelta: 2,
    };
  }
}
