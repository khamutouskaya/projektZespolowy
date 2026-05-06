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
