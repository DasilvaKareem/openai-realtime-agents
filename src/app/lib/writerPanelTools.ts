// Writer Panel Control Tools
// This allows the AI to open/close the Writer panel and manage its state

import { xClient } from './xClient';

// Global writer panel state - will be set by the App component
let globalWriterState: {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  width: number;
  setWidth: (width: number) => void;
} | null = null;

export const setGlobalWriterState = (state: typeof globalWriterState) => {
  globalWriterState = state;
};

export const getGlobalWriterState = () => globalWriterState;

// Tool implementations
export const writerPanelTools = {
  openWriterPanel: async (args?: { width?: number }) => {
    try {
      if (!globalWriterState) {
        return {
          success: false,
          error: 'Writer panel controls not available. Please refresh the page.'
        };
      }

      const { width = 470 } = args || {};

      // Open the writer panel
      globalWriterState.setIsExpanded(true);

      // Set custom width if provided
      if (width !== 470) {
        globalWriterState.setWidth(Math.min(Math.max(width, 300), 800));
      }

      return {
        success: true,
        message: 'Writer panel opened successfully. You can now see it on the right side of your screen.',
        isOpen: true,
        width: globalWriterState.width
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to open Writer panel'
      };
    }
  },

  closeWriterPanel: async () => {
    try {
      if (!globalWriterState) {
        return {
          success: false,
          error: 'Writer panel controls not available. Please refresh the page.'
        };
      }

      globalWriterState.setIsExpanded(false);

      return {
        success: true,
        message: 'Writer panel closed successfully.',
        isOpen: false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to close Writer panel'
      };
    }
  },

  toggleWriterPanel: async () => {
    try {
      if (!globalWriterState) {
        return {
          success: false,
          error: 'Writer panel controls not available. Please refresh the page.'
        };
      }

      const newState = !globalWriterState.isExpanded;
      globalWriterState.setIsExpanded(newState);

      return {
        success: true,
        message: `Writer panel ${newState ? 'opened' : 'closed'} successfully.`,
        isOpen: newState,
        width: globalWriterState.width
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle Writer panel'
      };
    }
  },

  getWriterPanelStatus: async () => {
    try {
      if (!globalWriterState) {
        return {
          success: false,
          error: 'Writer panel controls not available. Please refresh the page.'
        };
      }

      return {
        success: true,
        isOpen: globalWriterState.isExpanded,
        width: globalWriterState.width,
        message: `Writer panel is currently ${globalWriterState.isExpanded ? 'open' : 'closed'}.`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get Writer panel status'
      };
    }
  },

  resizeWriterPanel: async (args: { width: number }) => {
    try {
      if (!globalWriterState) {
        return {
          success: false,
          error: 'Writer panel controls not available. Please refresh the page.'
        };
      }

      const { width } = args;
      const clampedWidth = Math.min(Math.max(width, 300), 800);

      globalWriterState.setWidth(clampedWidth);

      // Open panel if it's closed
      if (!globalWriterState.isExpanded) {
        globalWriterState.setIsExpanded(true);
      }

      return {
        success: true,
        message: `Writer panel resized to ${clampedWidth}px width.`,
        isOpen: true,
        width: clampedWidth
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resize Writer panel'
      };
    }
  },

  postTweet: async (args: { text: string }) => {
    try {
      const { text } = args;

      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: 'Tweet text cannot be empty'
        };
      }

      if (text.length > 280) {
        return {
          success: false,
          error: `Tweet text is too long (${text.length} characters). Maximum allowed is 280 characters.`
        };
      }

      const result = await xClient.postTweet(text);

      if (result.success) {
        return {
          success: true,
          message: 'Tweet posted successfully!',
          tweetId: result.tweetId,
          tweetUrl: `https://x.com/i/web/status/${result.tweetId}`
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to post tweet'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post tweet'
      };
    }
  }
};

// Tool definitions for the supervisor agent
export const writerPanelToolDefinitions = [
  {
    type: "function",
    name: "openWriterPanel",
    description: "Open the Writer panel so the user can see the content. Always use this before writing content if the panel is closed.",
    parameters: {
      type: "object",
      properties: {
        width: {
          type: "number",
          description: "Optional width for the Writer panel (300-800px, default: 470px)",
          minimum: 300,
          maximum: 800
        }
      },
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "closeWriterPanel",
    description: "Close the Writer panel to give more space to the chat area.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "toggleWriterPanel",
    description: "Toggle the Writer panel open/closed.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "getWriterPanelStatus",
    description: "Check if the Writer panel is currently open or closed.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "resizeWriterPanel",
    description: "Resize the Writer panel to a specific width.",
    parameters: {
      type: "object",
      properties: {
        width: {
          type: "number",
          description: "New width for the Writer panel (300-800px)",
          minimum: 300,
          maximum: 800
        }
      },
      required: ["width"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "postTweet",
    description: "Post a tweet to X/Twitter. The tweet text must be 280 characters or less.",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The text content of the tweet (maximum 280 characters)",
          maxLength: 280
        }
      },
      required: ["text"],
      additionalProperties: false
    }
  }
];