"use client";

import { useEffect, useState } from "react";
import {
  MODULE_COMPLETE_EVENT,
  getCompletedModules,
} from "@/lib/module-completion";
import {
  PROGRESS_RESET_EVENT,
  isCourseFullyComplete,
  resetCourseProgressFull,
  resetCourseProgressPreservingBaseline,
} from "@/lib/progress-reset";
import { modules } from "@/content/course";

const FULL_RESET_CONFIRM_PHRASE = "START OVER";

export function ResetCourseProgress() {
  const [eligible, setEligible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function refresh() {
      setEligible(isCourseFullyComplete());
    }
    refresh();
    window.addEventListener(MODULE_COMPLETE_EVENT, refresh);
    window.addEventListener(PROGRESS_RESET_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(MODULE_COMPLETE_EVENT, refresh);
      window.removeEventListener(PROGRESS_RESET_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!eligible) return null;

  function handlePracticeReset() {
    const completed = getCompletedModules().length;
    const confirmed = window.confirm(
      `Reset course progress?\n\nThis clears checkmarks, lesson answers, the Capstone draft, and your Module 10 retest (${completed}/${modules.length} modules).\n\nYour Module 01 baseline stays locked as your starting snapshot.`,
    );
    if (!confirmed) return;

    const result = resetCourseProgressPreservingBaseline();
    if (!result.ok) {
      setMessage("Reset isn’t available yet. Finish every module first.");
      return;
    }
    setMessage(
      "Progress reset. Module 01 baseline kept. You can walk the course again for practice.",
    );
    setEligible(false);
  }

  function handleFullReset() {
    const first = window.confirm(
      `Clear baseline and start over?\n\nThis permanently deletes your Module 01 baseline score, all module checkmarks, quiz answers, Capstone draft, and Module 10 retest on this device.\n\nYou cannot undo this. Improvement comparison will only work after you score a new baseline.`,
    );
    if (!first) return;

    const typed = window.prompt(
      `Type ${FULL_RESET_CONFIRM_PHRASE} to confirm a full wipe (including Module 01 baseline):`,
    );
    if (typed?.trim().toUpperCase() !== FULL_RESET_CONFIRM_PHRASE) {
      setMessage("Full reset cancelled — confirmation phrase did not match.");
      return;
    }

    const result = resetCourseProgressFull();
    if (!result.ok) {
      setMessage("Full reset isn’t available yet. Finish every module first.");
      return;
    }
    setMessage(
      "Everything cleared on this device, including Module 01 baseline. Start again from Module 01.",
    );
    setEligible(false);
  }

  return (
    <div className="panel reset-course-panel">
      <h2>Reset course progress</h2>
      <p className="muted" style={{ margin: "0.35rem 0 0.85rem" }}>
        Available after you complete every module. Choose practice reset to keep
        your Module 01 baseline, or a full wipe to score a brand-new baseline.
      </p>
      <div className="cta-row reset-course-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handlePracticeReset}
        >
          Reset course progress
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleFullReset}
        >
          Clear baseline and start over
        </button>
      </div>
      {message ? (
        <p className="faint" style={{ marginTop: "0.75rem" }}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
