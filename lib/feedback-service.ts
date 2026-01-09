import { Feedback, FeedbackType, FeedbackStatus } from "./feedback-types";

const STORAGE_KEY = "vigie-feedbacks";

export function getFeedbacks(): Feedback[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addFeedback(
  type: FeedbackType,
  message: string,
  page: string
): Feedback {
  const feedback: Feedback = {
    id: crypto.randomUUID(),
    type,
    page,
    message,
    status: "new",
    createdAt: new Date().toISOString(),
  };

  const feedbacks = getFeedbacks();
  feedbacks.unshift(feedback);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks));

  return feedback;
}

export function updateFeedbackStatus(id: string, status: FeedbackStatus): void {
  const feedbacks = getFeedbacks();
  const index = feedbacks.findIndex((f) => f.id === id);
  if (index !== -1) {
    feedbacks[index].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks));
  }
}

export function deleteFeedback(id: string): void {
  const feedbacks = getFeedbacks().filter((f) => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks));
}

export function getFeedbackStats() {
  const feedbacks = getFeedbacks();
  return {
    total: feedbacks.length,
    new: feedbacks.filter((f) => f.status === "new").length,
    byType: {
      bug: feedbacks.filter((f) => f.type === "bug").length,
      improvement: feedbacks.filter((f) => f.type === "improvement").length,
      question: feedbacks.filter((f) => f.type === "question").length,
    },
  };
}
