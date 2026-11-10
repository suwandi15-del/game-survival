export type PostId = 1 | 2 | 3 | 4 | 5 | 6;

export type QuestionOption = {
  id: string;
  label: string;
  isCorrect: boolean;
};

export type Question = {
  id: number;
  text: string;
  context?: string;
  options: QuestionOption[];
  hint: string;
  explanation: string;
  difficulty: 'Dasar' | 'Sedang' | 'Tantangan SMK';
};

export type ExampleProblem = {
  title: string;
  problem: string;
  steps: string[];
  answer: string;
};

export type PostData = {
  id: PostId;
  title: string;
  subtitle: string;
  gameName: string;
  gameGenre: string;
  themeColor: string; // e.g. tailwind border/bg classes
  badgeColor: string;
  characterName: string;
  characterDesc: string;
  ruleFormula: string;
  ruleDescription: string;
  ruleNotes: string;
  examples: ExampleProblem[];
  questions: Question[];
};

export type GameProgress = {
  unlockedPosts: number; // 1 to 6
  completedQuestions: Record<PostId, number>; // number of correct questions 0..5
  scores: Record<PostId, number>;
  coins: number;
  totalScore: number;
  totalAttempts: number;
  wrongAttempts: number;
  startTime: number;
  completedTime: number | null;
};
