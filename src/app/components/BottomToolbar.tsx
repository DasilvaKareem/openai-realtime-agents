import React from "react";
import { SessionStatus } from "@/app/types";

interface BottomToolbarProps {
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
  isPTTActive: boolean;
  setIsPTTActive: (val: boolean) => void;
  isPTTUserSpeaking: boolean;
  handleTalkButtonDown: () => void;
  handleTalkButtonUp: () => void;
  isEventsPaneExpanded: boolean;
  setIsEventsPaneExpanded: (val: boolean) => void;
  isWriterExpanded: boolean;
  setIsWriterExpanded: (val: boolean) => void;
  isAudioPlaybackEnabled: boolean;
  setIsAudioPlaybackEnabled: (val: boolean) => void;
  codec: string;
  onCodecChange: (newCodec: string) => void;
}

function BottomToolbar({
  sessionStatus,
  onToggleConnection,
  isPTTActive,
  setIsPTTActive,
  isPTTUserSpeaking,
  handleTalkButtonDown,
  handleTalkButtonUp,
  isEventsPaneExpanded,
  setIsEventsPaneExpanded,
  isWriterExpanded,
  setIsWriterExpanded,
  isAudioPlaybackEnabled,
  setIsAudioPlaybackEnabled,
  codec,
  onCodecChange,
}: BottomToolbarProps) {
  const isConnected = sessionStatus === "CONNECTED";
  const isConnecting = sessionStatus === "CONNECTING";

  const handleCodecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCodec = e.target.value;
    onCodecChange(newCodec);
  };

  function getConnectionButtonLabel() {
    if (isConnected) return "Disconnect";
    if (isConnecting) return "Connecting...";
    return "Connect";
  }

  function getConnectionButtonClasses() {
    const baseClasses = "snes-button text-sm w-36 h-10";
    const cursorClass = isConnecting ? "cursor-not-allowed" : "cursor-pointer";

    if (isConnected) {
      // Connected -> label "Disconnect" -> red with LED effect
      return `bg-snes-accent-red hover:bg-red-600 ${cursorClass} ${baseClasses} snes-led-active`;
    }
    if (isConnecting) {
      // Connecting -> pulsing red
      return `bg-snes-accent-red ${cursorClass} ${baseClasses} animate-snes-pulse-fast`;
    }
    // Disconnected -> green
    return `bg-snes-accent-green hover:bg-snes-accent-green-hover ${cursorClass} ${baseClasses}`;
  }

  return (
    <div className="snes-panel mx-2 mb-2 p-4 flex flex-row items-center justify-center gap-x-8">
      <button
        onClick={onToggleConnection}
        className={getConnectionButtonClasses()}
        disabled={isConnecting}
      >
        {getConnectionButtonLabel()}
      </button>

      <div className="flex flex-row items-center gap-3">
        <input
          id="push-to-talk"
          type="checkbox"
          checked={isPTTActive}
          onChange={(e) => setIsPTTActive(e.target.checked)}
          disabled={!isConnected}
          className="snes-checkbox"
        />
        <label
          htmlFor="push-to-talk"
          className="snes-label cursor-pointer"
        >
          Push to talk
        </label>
        <button
          onMouseDown={handleTalkButtonDown}
          onMouseUp={handleTalkButtonUp}
          onTouchStart={handleTalkButtonDown}
          onTouchEnd={handleTalkButtonUp}
          disabled={!isPTTActive}
          className={`snes-button text-sm px-4 py-2 ${
            isPTTUserSpeaking 
              ? "snes-led-active snes-sound-wave" 
              : isPTTActive 
                ? "hover:bg-snes-accent-green-hover" 
                : "opacity-50 cursor-not-allowed"
          }`}
        >
          Talk
        </button>
      </div>

      <div className="flex flex-row items-center gap-3">
        <input
          id="audio-playback"
          type="checkbox"
          checked={isAudioPlaybackEnabled}
          onChange={(e) => setIsAudioPlaybackEnabled(e.target.checked)}
          disabled={!isConnected}
          className="snes-checkbox"
        />
        <label
          htmlFor="audio-playback"
          className="snes-label cursor-pointer"
        >
          Audio playback
        </label>
      </div>

      <div className="flex flex-row items-center gap-3">
        <input
          id="logs"
          type="checkbox"
          checked={isEventsPaneExpanded}
          onChange={(e) => setIsEventsPaneExpanded(e.target.checked)}
          className="snes-checkbox"
        />
        <label htmlFor="logs" className="snes-label cursor-pointer">
          Logs
        </label>
      </div>

      <div className="flex flex-row items-center gap-3">
        <input
          id="writer"
          type="checkbox"
          checked={isWriterExpanded}
          onChange={(e) => setIsWriterExpanded(e.target.checked)}
          className="snes-checkbox"
        />
        <label htmlFor="writer" className="snes-label cursor-pointer">
          Writer
        </label>
      </div>

      <div className="flex flex-row items-center gap-2">
        <span className="snes-label">Codec:</span>
        {/*
          Codec selector – Lets you force the WebRTC track to use 8 kHz 
          PCMU/PCMA so you can preview how the agent will sound 
          (and how ASR/VAD will perform) when accessed via a 
          phone network.  Selecting a codec reloads the page with ?codec=...
          which our App-level logic picks up and applies via a WebRTC monkey
          patch (see codecPatch.ts).
        */}
        <select
          id="codec-select"
          value={codec}
          onChange={handleCodecChange}
          className="snes-select text-sm"
        >
          <option value="opus">Opus (48 kHz)</option>
          <option value="pcmu">PCMU (8 kHz)</option>
          <option value="pcma">PCMA (8 kHz)</option>
        </select>
      </div>
    </div>
  );
}

export default BottomToolbar;
