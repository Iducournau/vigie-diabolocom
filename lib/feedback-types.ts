export type FeedbackType = "bug" | "improvement" | "question";

export type FeedbackStatus = "new" | "reviewed" | "planned" | "done" | "dismissed";

export interface Feedback {
  id: string;
  type: FeedbackType;
  page: string;
  message: string;
  status: FeedbackStatus;
  createdAt: string;
}

export const feedbackTypeLabels: Record<FeedbackType, string> = {
  bug: "Bug",
  improvement: "Amélioration",
  question: "Question",
};

export const feedbackTypeIcons: Record<FeedbackType, string> = {
  bug: "Bug",
  improvement: "Lightbulb",
  question: "HelpCircle",
};

export const feedbackStatusLabels: Record<FeedbackStatus, string> = {
  new: "Nouveau",
  reviewed: "Vu",
  planned: "Planifié",
  done: "Fait",
  dismissed: "Écarté",
};

export const feedbackStatusColors: Record<FeedbackStatus, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  reviewed: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400",
  planned: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  dismissed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};
