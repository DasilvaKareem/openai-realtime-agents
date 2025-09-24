"use client";

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { setGlobalEditor } from '../lib/tiptapTools';
// Remove BubbleMenu and FloatingMenu for now - they're causing import issues in v3
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
// Removed Color and TextStyle extensions to fix import issues

const Writer: React.FC = () => {
  const [isAiActive, setIsAiActive] = useState(false);
  const [lastAiChange, setLastAiChange] = useState<Date | null>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing... Use markdown shortcuts like # for headings, - for lists, etc.',
        emptyEditorClass: 'is-editor-empty',
      }),
      Typography,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: `
      <h1>Welcome to the Writer</h1>
      <p>This is a powerful text editor with:</p>
      <ul>
        <li>Markdown shortcuts (try typing # for headings)</li>
        <li>Rich text formatting</li>
        <li>Task lists</li>
        <li>And much more!</li>
      </ul>
      <p>Start typing to see the inline toolbar when you select text.</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[400px] p-4 text-snes-text-primary',
      },
    },
  });

  // Register this editor globally so the agent can use it
  useEffect(() => {
    if (editor) {
      setGlobalEditor(editor);

      // Add event listeners for content changes
      editor.on('update', ({ editor: updatedEditor }) => {
        // Check if this was an AI-triggered change
        const aiTriggered = (window as any).__aiEditorActive;
        if (aiTriggered) {
          setIsAiActive(true);
          setLastAiChange(new Date());

          // Clear AI active state after animation
          setTimeout(() => {
            setIsAiActive(false);
            (window as any).__aiEditorActive = false;
          }, 3000);
        }
      });
    }
    return () => {
      setGlobalEditor(null);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="writer-container h-full flex flex-col snes-panel">
      {/* Toolbar */}
      <div className="toolbar flex items-center gap-2 p-3 border-b border-snes-border flex-wrap bg-snes-bg-secondary">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`snes-button text-xs px-2 py-1 min-w-0 ${
            editor.isActive('heading', { level: 1 }) ? 'snes-button-active' : ''
          }`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`snes-button text-xs px-2 py-1 min-w-0 ${
            editor.isActive('heading', { level: 2 }) ? 'snes-button-active' : ''
          }`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`snes-button text-xs px-2 py-1 min-w-0 ${
            editor.isActive('heading', { level: 3 }) ? 'snes-button-active' : ''
          }`}
        >
          H3
        </button>

        <div className="w-px h-6 bg-snes-border mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`snes-button text-xs px-2 py-1 min-w-0 font-bold ${
            editor.isActive('bold') ? 'snes-button-active' : ''
          }`}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`snes-button text-xs px-2 py-1 min-w-0 italic ${
            editor.isActive('italic') ? 'snes-button-active' : ''
          }`}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`snes-button text-xs px-2 py-1 min-w-0 line-through ${
            editor.isActive('strike') ? 'snes-button-active' : ''
          }`}
        >
          S
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`snes-button text-xs px-2 py-1 min-w-0 ${
            editor.isActive('highlight') ? 'snes-button-active' : ''
          }`}
        >
          MARK
        </button>

        <div className="w-px h-6 bg-snes-border mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`snes-button text-xs px-2 py-1 min-w-0 ${
            editor.isActive('bulletList') ? 'snes-button-active' : ''
          }`}
        >
          LIST
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`snes-button text-xs px-2 py-1 min-w-0 ${
            editor.isActive('orderedList') ? 'snes-button-active' : ''
          }`}
        >
          1.2.3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`snes-button text-xs px-2 py-1 min-w-0 ${
            editor.isActive('taskList') ? 'snes-button-active' : ''
          }`}
        >
          TASK
        </button>

        <div className="w-px h-6 bg-snes-border mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`snes-button text-xs px-2 py-1 min-w-0 font-mono ${
            editor.isActive('code') ? 'snes-button-active' : ''
          }`}
        >
          CODE
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`snes-button text-xs px-2 py-1 min-w-0 font-mono ${
            editor.isActive('codeBlock') ? 'snes-button-active' : ''
          }`}
        >
          BLOCK
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`snes-button text-xs px-2 py-1 min-w-0 ${
            editor.isActive('blockquote') ? 'snes-button-active' : ''
          }`}
        >
          QUOTE
        </button>

        <div className="w-px h-6 bg-snes-border mx-1" />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="snes-button text-xs px-2 py-1 min-w-0 disabled:opacity-50"
        >
          UNDO
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="snes-button text-xs px-2 py-1 min-w-0 disabled:opacity-50"
        >
          REDO
        </button>
      </div>

      {/* Bubble Menu and Floating Menu removed due to import issues in Tiptap v3 */}

      {/* Editor Content */}
      <div className="editor-wrapper flex-1 overflow-auto bg-snes-bg-primary">
        <EditorContent editor={editor} />
      </div>

      {/* Status Bar */}
      <div className="status-bar flex items-center justify-between px-3 py-2 border-t border-snes-border text-xs text-snes-text-secondary bg-snes-bg-secondary">
        <div className="snes-label">
          CHARS: {editor.storage.characterCount?.characters() || 0} | WORDS: {editor.storage.characterCount?.words() || 0}
        </div>
        <div className="flex items-center gap-2">
          {isAiActive && (
            <div className="ai-activity-indicator snes-label">
              <span className="text-snes-accent-green">●</span>
              AI WRITING...
            </div>
          )}
          {lastAiChange && !isAiActive && (
            <div className="snes-label">
              LAST AI EDIT: {lastAiChange.toLocaleTimeString()}
            </div>
          )}
          <div className="snes-label">
            MARKDOWN MODE: ON
          </div>
        </div>
      </div>
    </div>
  );
};

export default Writer;