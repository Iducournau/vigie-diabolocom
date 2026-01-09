"use client";

import { useState, useEffect } from "react";
import { Bug, Lightbulb, HelpCircle, Trash2, Clock, Plus, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Feedback,
  FeedbackType,
  FeedbackStatus,
  feedbackTypeLabels,
  feedbackStatusLabels,
  feedbackStatusColors,
} from "@/lib/feedback-types";
import {
  getFeedbacks,
  updateFeedbackStatus,
  deleteFeedback,
  addFeedback,
} from "@/lib/feedback-service";

const statusOptions: FeedbackStatus[] = [
  "new",
  "reviewed",
  "planned",
  "done",
  "dismissed",
];

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState<"all" | FeedbackStatus>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newType, setNewType] = useState<FeedbackType | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setFeedbacks(getFeedbacks());
  }, []);

  const handleStatusChange = (id: string, status: FeedbackStatus) => {
    updateFeedbackStatus(id, status);
    setFeedbacks(getFeedbacks());
  };

  const handleDelete = (id: string) => {
    if (confirm("Supprimer ce feedback ?")) {
      deleteFeedback(id);
      setFeedbacks(getFeedbacks());
    }
  };

  const handleSubmit = () => {
    if (!newType || !newMessage.trim()) return;

    addFeedback(newType, newMessage.trim(), "/feedbacks");
    setSubmitted(true);

    setTimeout(() => {
      setIsModalOpen(false);
      setNewType(null);
      setNewMessage("");
      setSubmitted(false);
      setFeedbacks(getFeedbacks());
    }, 1500);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewType(null);
    setNewMessage("");
    setSubmitted(false);
  };

  const filteredFeedbacks =
    filter === "all"
      ? feedbacks
      : feedbacks.filter((f) => f.status === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="h-4 w-4 text-red-500" />;
      case "improvement":
        return <Lightbulb className="h-4 w-4 text-amber-500" />;
      case "question":
        return <HelpCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const newCount = feedbacks.filter((f) => f.status === "new").length;

  const typeButtons: { value: FeedbackType; icon: React.ReactNode; color: string }[] = [
    {
      value: "bug",
      icon: <Bug className="h-4 w-4" />,
      color: "hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/50 dark:hover:text-red-400",
    },
    {
      value: "improvement",
      icon: <Lightbulb className="h-4 w-4" />,
      color: "hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/50 dark:hover:text-amber-400",
    },
    {
      value: "question",
      icon: <HelpCircle className="h-4 w-4" />,
      color: "hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/50 dark:hover:text-blue-400",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Feedbacks
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {feedbacks.length} feedback{feedbacks.length > 1 ? "s" : ""} •{" "}
            {newCount} nouveau{newCount > 1 ? "x" : ""}
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau feedback
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className={filter === "all" ? "bg-orange-500 hover:bg-orange-600" : ""}
        >
          Tous ({feedbacks.length})
        </Button>
        {statusOptions.map((status) => {
          const count = feedbacks.filter((f) => f.status === status).length;
          return (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className={filter === status ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              {feedbackStatusLabels[status]} ({count})
            </Button>
          );
        })}
      </div>

      {/* List */}
      {filteredFeedbacks.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">
            Aucun feedback pour le moment
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFeedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Type + Status */}
                  <div className="mb-2 flex items-center gap-2">
                    {getTypeIcon(feedback.type)}
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {feedbackTypeLabels[feedback.type]}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        feedbackStatusColors[feedback.status]
                      }`}
                    >
                      {feedbackStatusLabels[feedback.status]}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                    {feedback.message}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(feedback.createdAt)}
                    </span>
                    <span>Page : {feedback.page}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <select
                    value={feedback.status}
                    onChange={(e) =>
                      handleStatusChange(feedback.id, e.target.value as FeedbackStatus)
                    }
                    className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {feedbackStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(feedback.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                  <Send className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Feedback ajouté !
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Nouveau feedback
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Type selection */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </label>
                  <div className="flex gap-2">
                    {typeButtons.map((btn) => (
                      <button
                        key={btn.value}
                        onClick={() => setNewType(btn.value)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          newType === btn.value
                            ? btn.value === "bug"
                              ? "border-red-300 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/50 dark:text-red-400"
                              : btn.value === "improvement"
                              ? "border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/50 dark:text-amber-400"
                              : "border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-400"
                            : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 " +
                              btn.color
                        }`}
                      >
                        {btn.icon}
                        {feedbackTypeLabels[btn.value]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Message
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Décris ton feedback..."
                    rows={4}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={handleCloseModal}>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!newType || !newMessage.trim()}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Ajouter
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}