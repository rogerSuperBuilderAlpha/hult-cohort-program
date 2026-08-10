"use client";

import { useEffect, useState } from "react";
import { PROGRESS_RESET_EVENT } from "@/lib/progress-reset";

const STORAGE_KEY = "score-course-capstone-assemble-v1";

/** Optional written assemble step after the Capstone MCQs — not required to unlock completion. */
export function CapstoneAssembleBox() {
  const [prompt, setPrompt] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    function hydrate() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        setPrompt(raw ?? "");
      } catch {
        setPrompt("");
      }
      setSaved(false);
    }
    hydrate();
    window.addEventListener(PROGRESS_RESET_EVENT, hydrate);
    return () => window.removeEventListener(PROGRESS_RESET_EVENT, hydrate);
  }, []);

  function save() {
    window.localStorage.setItem(STORAGE_KEY, prompt.trim());
    setSaved(true);
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div className="exercise">
        <strong>Optional — Assemble your SCORE prompt</strong>
        <p style={{ margin: "0.5rem 0 0" }}>
          Using the scenario and your Part A answers, write the full prompt you
          would paste into Copilot. This is practice only — it does not change
          your quiz score.
        </p>
      </div>
      <label className="prompt-label" htmlFor="capstone-assemble">
        Your assembled SCORE prompt
      </label>
      <textarea
        id="capstone-assemble"
        className="prompt-input"
        rows={10}
        value={prompt}
        onChange={(e) => {
          setPrompt(e.target.value);
          setSaved(false);
        }}
        placeholder="Act as an Operations Manager. On-time delivery fell… Context… Objective… Expectations…"
      />
      <div className="cta-row" style={{ marginTop: "0.75rem" }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={save}
          disabled={prompt.trim().length < 20}
        >
          {saved ? "Saved on this device" : "Save draft"}
        </button>
      </div>
    </div>
  );
}
