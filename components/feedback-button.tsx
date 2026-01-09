"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, Bug, Lightbulb, HelpCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FeedbackType,
  feedbackTypeLabels,
} from "@/lib/feedback-types";
import { addFeedback } from "@/lib/feedback-service";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const pathname = usePathname();

  const handleSubmit = () => {
    if (!type || !message.trim()) return;

    addFeedback(type, message.trim(), pathname);
    setSubmitted(true);

    setTimeout(() => {
      setIsOpen(false);
      setType(null);
      setMessage("");
      setSubmitted(false);
    }, 1500);
  };

  const handleClose = () => {
    setIsOpen(false);
    setType(null);
    setMessage("");
    setSubmitted(false);
  };

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
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-transform hover:scale-105 hover:bg-orange-600"
        title="Donner un feedback"
      >
        <MessageSquarePlus className="h-5 w-5" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                  <Send className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Merci pour ton feedback !
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Feedback
                  </h3>
                  <button
                    onClick={handleClose}
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
                        onClick={() => setType(btn.value)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          type === btn.value
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
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Décris ton feedback..."
                    rows={4}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                  />
                </div>

                {/* Page context */}
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  Page : {pathname}
                </p>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={handleClose}>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!type || !message.trim()}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Envoyer
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
