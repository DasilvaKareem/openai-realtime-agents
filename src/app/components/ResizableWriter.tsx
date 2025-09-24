"use client";

import React, { useState, useRef, useEffect } from 'react';
import Writer from './Writer';

interface ResizableWriterProps {
  width: number;
  onWidthChange: (width: number) => void;
}

const ResizableWriter: React.FC<ResizableWriterProps> = ({ width, onWidthChange }) => {
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;

      // Set min/max width constraints
      const minWidth = 300;
      const maxWidth = 800;
      const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);

      onWidthChange(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, onWidthChange]);

  return (
    <div
      ref={containerRef}
      className="relative flex"
      style={{ width: `${width}px` }}
    >
      {/* Resize Handle */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 cursor-col-resize group z-10 ${
          isResizing ? 'bg-snes-accent-green' : 'hover:bg-snes-accent-green'
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Visual indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-0.5 h-8 bg-snes-accent-green-hover rounded-full" />
        </div>
      </div>

      {/* Writer Content */}
      <div className="flex-1 ml-1">
        <Writer />
      </div>
    </div>
  );
};

export default ResizableWriter;