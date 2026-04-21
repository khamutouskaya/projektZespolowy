export type ZoneScores = Record<string, number>;

export type TestResult = {
  totalScore: number;
  zoneScores: ZoneScores;
};

let stored: TestResult | null = null;

export const testResultTransfer = {
  set: (result: TestResult) => { stored = result; },
  get: (): TestResult | null => stored,
  clear: () => { stored = null; },
};
