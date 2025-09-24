import React, { useState } from "react";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ClockIcon,
} from "@radix-ui/react-icons";
import { GuardrailResultType } from "../types";

export interface ModerationChipProps {
  moderationCategory: string;
  moderationRationale: string;
}

function formatCategory(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function GuardrailChip({
  guardrailResult,
}: {
  guardrailResult: GuardrailResultType;
}) {
  const [expanded, setExpanded] = useState(false);

  // Consolidate state into a single variable: "PENDING", "PASS", or "FAIL"
  const state =
    guardrailResult.status === "IN_PROGRESS"
      ? "PENDING"
      : guardrailResult.category === "NONE"
      ? "PASS"
      : "FAIL";

  // Variables for icon, label, and styling classes based on state
  let IconComponent;
  let label: string;
  let textColorClass: string;
  switch (state) {
    case "PENDING":
      IconComponent = ClockIcon;
      label = "Pending";
      textColorClass = "text-snes-text-muted";
      break;
    case "PASS":
      IconComponent = CheckCircledIcon;
      label = "Pass";
      textColorClass = "text-snes-accent-green";
      break;
    case "FAIL":
      IconComponent = CrossCircledIcon;
      label = "Fail";
      textColorClass = "text-snes-accent-red";
      break;
    default:
      IconComponent = ClockIcon;
      label = "Pending";
      textColorClass = "text-snes-text-muted";
  }

  return (
    <div className="text-xs font-snes-body">
      <div
        onClick={() => {
          // Only allow toggling the expanded state for PASS/FAIL cases.
          if (state !== "PENDING") {
            setExpanded(!expanded);
          }
        }}
        // Only add pointer cursor if clickable (PASS or FAIL state)
        className={`inline-flex items-center gap-1 rounded-snes-sm ${
          state !== "PENDING" ? "cursor-pointer hover:bg-snes-bg-primary px-2 py-1" : ""
        }`}
      >
        <span className="snes-label">Guardrail:</span>
        <div className={`flex items-center gap-1 ${textColorClass}`}>
          <IconComponent /> {label}
        </div>
      </div>
      {/* Container for expandable content */}
      {state !== "PENDING" && guardrailResult.category && guardrailResult.rationale && (
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pt-2 text-xs">
            <strong className="text-snes-text-primary">
              Moderation Category: {formatCategory(guardrailResult.category)}
            </strong>
            <div className="text-snes-text-primary">{guardrailResult.rationale}</div>
            {guardrailResult.testText && (
              <blockquote className="mt-1 border-l-2 border-snes-border pl-2 text-snes-text-muted">
                {guardrailResult.testText}
              </blockquote>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 