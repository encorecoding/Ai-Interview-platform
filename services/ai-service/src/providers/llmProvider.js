/**
 * AI Provider Abstraction Layer
 *
 * Supports:
 * - OpenAI (gpt-4o, gpt-4o-mini)
 * - Groq (llama-3.1-70b, mixtral)
 * - Any OpenAI-compatible endpoint
 *
 * Configure via environment variables:
 *   AI_API_KEY=your-key
 *   AI_MODEL=gpt-4o-mini
 *   AI_BASE_URL=https://api.openai.com/v1
 */

const { ChatOpenAI } = require('@langchain/openai');

let llmInstance = null;

/**
 * Get a configured LLM instance.
 * Throws if AI_API_KEY is not set.
 */
function getLLM(options = {}) {
  if (llmInstance && !options.temperature) return llmInstance;

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey || apiKey === 'your-ai-api-key') {
    throw new Error(
      'AI_API_KEY is not configured. Please set it in your .env file.\n' +
      'Supported providers: OpenAI, Groq, OpenRouter, or any OpenAI-compatible endpoint.\n' +
      'Set AI_BASE_URL to point to your provider if not using OpenAI.'
    );
  }

  const model = new ChatOpenAI({
    apiKey,
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 2000,
    configuration: {
      baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    },
  });

  if (!options.temperature) llmInstance = model;
  return model;
}

/**
 * Check if AI is available (API key configured)
 */
function isAIAvailable() {
  const key = process.env.AI_API_KEY;
  return !!(key && key !== 'your-ai-api-key' && key.length > 10);
}

/**
 * Generate text using the LLM with error handling
 */
async function generateText(prompt, options = {}) {
  if (!isAIAvailable()) {
    throw new Error('AI_API_KEY not configured');
  }

  const llm = getLLM(options);
  const response = await llm.invoke(prompt);
  return response.content;
}

module.exports = { getLLM, isAIAvailable, generateText };
