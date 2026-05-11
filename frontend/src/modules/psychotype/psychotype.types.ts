// Big Five (OCEAN) test types — /api/personality/
export type PersonalityQuestion = {
  id: number;
  text: string;
  trait: "O" | "C" | "E" | "A" | "N";
  reverse: boolean;
};

export type PersonalityAnswer = {
  questionId: number;
  value: number; // 1–5
};

export type PersonalityResult = {
  O: number;
  C: number;
  E: number;
  A: number;
  N: number;
};

// Legacy quiz types — kept for reference
export type QuizOption = {
  key: string;
  text: string;
  personalityTypeKey: string;
};

export type QuizQuestion = {
  id: number;
  text: string;
  options: QuizOption[];
};

export type QuizAnswer = {
  questionId: number;
  selectedKey: string;
};

export type QuizResult = {
  personalityType: string;
  title: string;
  description: string;
  scores: Record<string, number>;
};
