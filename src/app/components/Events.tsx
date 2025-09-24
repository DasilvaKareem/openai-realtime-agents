"use client";

import React, { useRef, useEffect, useState } from "react";
import { useEvent } from "@/app/contexts/EventContext";
import { LoggedEvent } from "@/app/types";

export interface EventsProps {
  isExpanded: boolean;
}

function Events({ isExpanded }: EventsProps) {
  const [prevEventLogs, setPrevEventLogs] = useState<LoggedEvent[]>([]);
  const eventLogsContainerRef = useRef<HTMLDivElement | null>(null);

  const { loggedEvents, toggleExpand } = useEvent();

  const getDirectionArrow = (direction: string) => {
    if (direction === "client") return { symbol: "▲", color: "var(--accent-green)" };
    if (direction === "server") return { symbol: "▼", color: "var(--accent-green-hover)" };
    return { symbol: "•", color: "var(--text-muted)" };
  };

  useEffect(() => {
    const hasNewEvent = loggedEvents.length > prevEventLogs.length;

    if (isExpanded && hasNewEvent && eventLogsContainerRef.current) {
      eventLogsContainerRef.current.scrollTop =
        eventLogsContainerRef.current.scrollHeight;
    }

    setPrevEventLogs(loggedEvents);
  }, [loggedEvents, isExpanded]);

  return (
    <div
      className={
        (isExpanded ? "w-1/2 overflow-auto" : "w-0 overflow-hidden opacity-0") +
        " transition-all duration-200 ease-in-out flex-col snes-panel"
      }
      ref={eventLogsContainerRef}
    >
      {isExpanded && (
        <div>
          <div className="flex items-center justify-between px-6 py-3.5 sticky top-0 z-10 text-base border-b-2 border-snes-border bg-snes-bg-secondary">
            <span className="snes-header text-lg">Logs</span>
          </div>
          <div>
            {loggedEvents.map((log, idx) => {
              const arrowInfo = getDirectionArrow(log.direction);
              const isError =
                log.eventName.toLowerCase().includes("error") ||
                log.eventData?.response?.status_details?.error != null;

              return (
                <div
                  key={`${log.id}-${idx}`}
                  className="border-t border-snes-border py-2 px-6 font-snes-body"
                >
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="flex items-center justify-between cursor-pointer hover:bg-snes-bg-primary transition-colors"
                  >
                    <div className="flex items-center flex-1">
                      <span
                        style={{ color: arrowInfo.color }}
                        className="ml-1 mr-2"
                      >
                      {arrowInfo.symbol}
                      </span>
                      <span
                        className={
                          "flex-1 text-sm font-snes-body " +
                          (isError ? "text-snes-accent-red" : "text-snes-text-primary")
                        }
                      >
                        {log.eventName}
                      </span>
                    </div>
                    <div className="text-snes-text-secondary ml-1 text-xs whitespace-nowrap font-snes-body">
                      {log.timestamp}
                    </div>
                  </div>

                  {log.expanded && log.eventData && (
                    <div className="text-snes-text-primary text-left">
                      <pre className="border-l-2 ml-1 border-snes-border whitespace-pre-wrap break-words font-snes-body text-xs mb-2 mt-2 pl-2">
                        {JSON.stringify(log.eventData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
