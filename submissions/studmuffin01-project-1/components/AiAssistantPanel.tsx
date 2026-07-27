"use client";

import { FormEvent, useMemo, useState } from "react";
import { ASSISTANT_SUGGESTED_PROMPTS, answerPortfolioQuestion } from "@/lib/assistantCoach";
import { buildPortfolioSnapshot } from "@/lib/assistantPortfolioContext";
import {
  commandCenterAiHintClassName,
  commandCenterAiPromptButtonClassName,
  commandCenterAiResponseClassName,
  commandCenterAiSectionClassName,
  commandCenterAiSubmitClassName,
  commandCenterAiTextareaClassName,
  commandCenterAiTitleClassName,
} from "@/lib/dashboardStyles";
import { useSidebarData } from "@/hooks/SidebarDataProvider";

export default function AiAssistantPanel() {
  const { isLoaded, initiatives, tasksByInitiative, members } = useSidebarData();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);

  const portfolioSnapshot = useMemo(() => {
    if (!isLoaded) {
      return null;
    }

    return buildPortfolioSnapshot(initiatives, tasksByInitiative, members);
  }, [initiatives, isLoaded, members, tasksByInitiative]);

  const askQuestion = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }

    if (!portfolioSnapshot) {
      setResponse("Still loading your portfolio data. Try again in a moment.");
      return;
    }

    setQuery(trimmed);
    setResponse(answerPortfolioQuestion(trimmed, portfolioSnapshot));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    askQuestion(query);
  };

  return (
    <section aria-label="AI Assistant" className={commandCenterAiSectionClassName}>
      <h2 className={commandCenterAiTitleClassName}>AI Assistant</h2>
      <p className={commandCenterAiHintClassName}>
        Ask about overdue work, priorities, initiative health, or team workload.
      </p>

      <div className="mt-2 flex flex-wrap gap-1">
        {ASSISTANT_SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => askQuestion(prompt)}
            disabled={!isLoaded}
            className={commandCenterAiPromptButtonClassName}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-2 space-y-2">
        <label htmlFor="ai-assistant-query" className="sr-only">
          Ask the AI Assistant
        </label>
        <textarea
          id="ai-assistant-query"
          rows={2}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. What's overdue on Power System Upgrade?"
          className={commandCenterAiTextareaClassName}
        />
        <button
          type="submit"
          disabled={!query.trim() || !isLoaded}
          className={commandCenterAiSubmitClassName}
        >
          {isLoaded ? "Ask" : "Loading…"}
        </button>
      </form>

      {response && (
        <div role="status" className={commandCenterAiResponseClassName}>
          {response}
        </div>
      )}
    </section>
  );
}
