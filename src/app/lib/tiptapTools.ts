// Tiptap Editor Tools for Agent Integration
// This allows the agent to write, edit, and manipulate content in the Tiptap editor

import { Editor } from '@tiptap/react';

// Global editor reference - will be set by the Writer component
let globalEditor: Editor | null = null;

export const setGlobalEditor = (editor: Editor | null) => {
  globalEditor = editor;
};

export const getGlobalEditor = () => globalEditor;

// Helper function to mark AI activity
const markAiActivity = () => {
  (window as any).__aiEditorActive = true;
};

// Tool implementations
export const tiptapTools = {
  writeContent: async (args: { content: string; mode?: 'replace' | 'append' | 'prepend'; highlight?: boolean }) => {
    try {
      if (!globalEditor) {
        return { success: false, error: 'Editor not available. Please open the Writer panel first.' };
      }

      const { content, mode = 'replace', highlight = true } = args;

      // Mark that AI is making changes
      markAiActivity();

      switch (mode) {
        case 'replace':
          globalEditor.commands.setContent(content);
          if (highlight) {
            // Highlight the entire new content
            globalEditor.commands.selectAll().setHighlight({ color: '#7CFC00' }).unsetHighlight();
          }
          break;
        case 'append':
          const appendPos = globalEditor.state.doc.content.size;
          globalEditor.commands.focus('end').insertContent(`\n\n${content}`);
          if (highlight) {
            // Highlight just the appended content
            globalEditor.commands
              .setTextSelection({ from: appendPos, to: globalEditor.state.doc.content.size })
              .setHighlight({ color: '#7CFC00' });
          }
          break;
        case 'prepend':
          globalEditor.commands.focus('start').insertContent(`${content}\n\n`);
          if (highlight) {
            // Highlight the prepended content
            globalEditor.commands
              .setTextSelection({ from: 1, to: content.length + 3 })
              .setHighlight({ color: '#7CFC00' });
          }
          break;
      }

      // Auto-remove highlights after 5 seconds
      if (highlight) {
        setTimeout(() => {
          globalEditor?.commands.selectAll().unsetHighlight();
        }, 5000);
      }

      return {
        success: true,
        message: `Content ${mode}d in the editor successfully.`,
        wordCount: globalEditor.storage.characterCount?.words() || 0,
        charCount: globalEditor.storage.characterCount?.characters() || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to write content'
      };
    }
  },

  insertAtCursor: async (args: { content: string; highlight?: boolean }) => {
    try {
      if (!globalEditor) {
        return { success: false, error: 'Editor not available. Please open the Writer panel first.' };
      }

      const { content, highlight = true } = args;

      markAiActivity();

      const startPos = globalEditor.state.selection.from;
      globalEditor.commands.insertContent(content);

      if (highlight) {
        // Highlight the inserted content
        globalEditor.commands
          .setTextSelection({ from: startPos, to: startPos + content.length })
          .setHighlight({ color: '#FFD700' });

        // Auto-remove highlight after 5 seconds
        setTimeout(() => {
          globalEditor?.commands
            .setTextSelection({ from: startPos, to: startPos + content.length })
            .unsetHighlight();
        }, 5000);
      }

      return {
        success: true,
        message: 'Content inserted at cursor position successfully.'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to insert content'
      };
    }
  },

  formatSelection: async (args: { format: 'bold' | 'italic' | 'code' | 'highlight' | 'strike' }) => {
    try {
      if (!globalEditor) {
        return { success: false, error: 'Editor not available. Please open the Writer panel first.' };
      }

      const { format } = args;
      let success = false;

      switch (format) {
        case 'bold':
          success = globalEditor.commands.toggleBold();
          break;
        case 'italic':
          success = globalEditor.commands.toggleItalic();
          break;
        case 'code':
          success = globalEditor.commands.toggleCode();
          break;
        case 'highlight':
          success = globalEditor.commands.toggleHighlight();
          break;
        case 'strike':
          success = globalEditor.commands.toggleStrike();
          break;
      }

      if (!success) {
        return { success: false, error: `Failed to apply ${format} formatting` };
      }

      return {
        success: true,
        message: `Applied ${format} formatting to selection.`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to format selection'
      };
    }
  },

  createHeading: async (args: { text: string; level: 1 | 2 | 3 | 4 | 5 | 6; highlight?: boolean }) => {
    try {
      if (!globalEditor) {
        return { success: false, error: 'Editor not available. Please open the Writer panel first.' };
      }

      const { text, level, highlight = true } = args;

      markAiActivity();

      const startPos = globalEditor.state.selection.from;
      globalEditor.commands
        .insertContent(`\n`)
        .setHeading({ level })
        .insertContent(text)
        .insertContent(`\n`);

      if (highlight) {
        // Highlight the new heading
        globalEditor.commands
          .setTextSelection({ from: startPos + 1, to: startPos + text.length + 1 })
          .setHighlight({ color: '#7CFC00' });

        setTimeout(() => {
          globalEditor?.commands
            .setTextSelection({ from: startPos + 1, to: startPos + text.length + 1 })
            .unsetHighlight();
        }, 5000);
      }

      return {
        success: true,
        message: `Created H${level} heading: "${text}"`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create heading'
      };
    }
  },

  createList: async (args: { items: string[]; type: 'bullet' | 'ordered' | 'task' }) => {
    try {
      if (!globalEditor) {
        return { success: false, error: 'Editor not available. Please open the Writer panel first.' };
      }

      const { items, type } = args;

      // Insert a new line first
      globalEditor.commands.insertContent(`\n`);

      // Set the appropriate list type
      switch (type) {
        case 'bullet':
          globalEditor.commands.toggleBulletList();
          break;
        case 'ordered':
          globalEditor.commands.toggleOrderedList();
          break;
        case 'task':
          globalEditor.commands.toggleTaskList();
          break;
      }

      // Insert the list items
      items.forEach((item, index) => {
        if (index > 0) {
          globalEditor?.commands.createParagraphNear();
        }
        globalEditor?.commands.insertContent(item);
      });

      globalEditor.commands.insertContent(`\n`);

      return {
        success: true,
        message: `Created ${type} list with ${items.length} items.`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create list'
      };
    }
  },

  addCodeBlock: async (args: { code: string; language?: string }) => {
    try {
      if (!globalEditor) {
        return { success: false, error: 'Editor not available. Please open the Writer panel first.' };
      }

      const { code, language } = args;

      globalEditor.commands
        .insertContent(`\n`)
        .toggleCodeBlock()
        .insertContent(code)
        .insertContent(`\n`);

      return {
        success: true,
        message: `Added code block${language ? ` (${language})` : ''}.`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add code block'
      };
    }
  },

  getContent: async () => {
    try {
      if (!globalEditor) {
        return { success: false, error: 'Editor not available. Please open the Writer panel first.' };
      }

      const htmlContent = globalEditor.getHTML();
      const textContent = globalEditor.getText();
      const jsonContent = globalEditor.getJSON();

      return {
        success: true,
        content: {
          html: htmlContent,
          text: textContent,
          json: jsonContent,
          wordCount: globalEditor.storage.characterCount?.words() || 0,
          charCount: globalEditor.storage.characterCount?.characters() || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get content'
      };
    }
  },

  clearContent: async () => {
    try {
      if (!globalEditor) {
        return { success: false, error: 'Editor not available. Please open the Writer panel first.' };
      }

      globalEditor.commands.clearContent();

      return {
        success: true,
        message: 'Editor content cleared successfully.'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear content'
      };
    }
  }
};

// Tool definitions for the supervisor agent
export const tiptapToolDefinitions = [
  {
    type: "function",
    name: "writeContent",
    description: "Write or replace content in the Tiptap editor. Use this to create new documents or completely replace existing content.",
    parameters: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The content to write (supports HTML and Markdown)"
        },
        mode: {
          type: "string",
          enum: ["replace", "append", "prepend"],
          description: "How to add the content: replace (default), append to end, or prepend to beginning",
          default: "replace"
        },
        highlight: {
          type: "boolean",
          description: "Whether to highlight the changes (default: true)",
          default: true
        }
      },
      required: ["content"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "insertAtCursor",
    description: "Insert content at the current cursor position in the editor.",
    parameters: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The content to insert at cursor position"
        }
      },
      required: ["content"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "createHeading",
    description: "Create a heading in the editor.",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The heading text"
        },
        level: {
          type: "number",
          enum: [1, 2, 3, 4, 5, 6],
          description: "Heading level (1-6)"
        }
      },
      required: ["text", "level"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "createList",
    description: "Create a list in the editor.",
    parameters: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: { type: "string" },
          description: "Array of list items"
        },
        type: {
          type: "string",
          enum: ["bullet", "ordered", "task"],
          description: "Type of list to create"
        }
      },
      required: ["items", "type"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "addCodeBlock",
    description: "Add a code block to the editor.",
    parameters: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "The code content"
        },
        language: {
          type: "string",
          description: "Programming language (optional)"
        }
      },
      required: ["code"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "getContent",
    description: "Get the current content from the editor.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "clearContent",
    description: "Clear all content from the editor.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  }
];