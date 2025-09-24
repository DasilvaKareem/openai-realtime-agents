// Image Generation Tool for OpenAI Agent SDK
// This provides image generation capabilities using OpenAI's DALL-E API

import OpenAI from 'openai';

export interface ImageGenerationResult {
  url: string;
  revised_prompt?: string;
  error?: string;
}

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

const getOpenAIClient = () => {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
};

export const imageGenerationTools = {
  generateImage: async (args: { prompt: string; size?: '1024x1024' | '1792x1024' | '1024x1792' }): Promise<ImageGenerationResult> => {
    try {
      console.log('Image generation request:', args);
      
      // Return a mock response if no API key is set
      if (!process.env.OPENAI_API_KEY) {
        console.log('No OpenAI API key found');
        return {
          url: '',
          error: 'OPENAI_API_KEY is not configured. Image generation is disabled.',
        };
      }

      const client = getOpenAIClient();
      console.log('Calling OpenAI DALL-E API...');
      
      const response = await client.images.generate({
        model: "dall-e-3",
        prompt: args.prompt,
        size: args.size || '1024x1024',
        quality: "standard",
        n: 1,
      });

      console.log('OpenAI response received:', response);
      const image = response.data[0];
      
      return {
        url: image.url || '',
        revised_prompt: image.revised_prompt || undefined,
      };
    } catch (error) {
      console.error('Image generation error:', error);
      return {
        url: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  generateImageVariation: async (args: { imageUrl: string; size?: '1024x1024' | '1792x1024' | '1024x1792' }): Promise<ImageGenerationResult> => {
    try {
      // Note: DALL-E 3 doesn't support image variations, but we can create a similar prompt
      // For now, we'll return an error explaining this limitation
      return {
        url: '',
        error: 'Image variations are not supported with DALL-E 3. Please use generateImage instead.',
      };
    } catch (error) {
      console.error('Image variation error:', error);
      return {
        url: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
};

// Tool definitions for the supervisor agent
export const imageGenerationToolDefinitions = [
  {
    type: "function",
    name: "generateImage",
    description: "Generate an image using DALL-E 3 based on a text prompt",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Detailed description of the image to generate. Be specific about style, composition, colors, and mood."
        },
        size: {
          type: "string",
          enum: ["1024x1024", "1792x1024", "1024x1792"],
          description: "Size of the generated image. 1024x1024 is square, 1792x1024 is landscape, 1024x1792 is portrait.",
          default: "1024x1024"
        }
      },
      required: ["prompt"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "generateImageVariation",
    description: "Generate variations of an existing image (Note: DALL-E 3 doesn't support this, will return an error)",
    parameters: {
      type: "object",
      properties: {
        imageUrl: {
          type: "string",
          description: "URL of the image to create variations of"
        },
        size: {
          type: "string",
          enum: ["1024x1024", "1792x1024", "1024x1792"],
          description: "Size of the generated image variation",
          default: "1024x1024"
        }
      },
      required: ["imageUrl"],
      additionalProperties: false
    }
  }
];
