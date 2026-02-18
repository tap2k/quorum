// Multi-LLM service for Quorum - conduct conversations with multiple LLMs simultaneously
// Supports: Anthropic, OpenAI, Google Gemini, xAI (Grok), and Meta (via DeepInfra)

// Helper function to get API key with fallback to environment variables
function getApiKey(provider, clientKeys = {}) {
  const keyMap = {
    'anthropic': 'ANTHROPIC_API_KEY',
    'openai': 'OPENAI_API_KEY',
    'google': 'GOOGLE_API_KEY',
    'xai': 'XAI_API_KEY',
    'deepinfra': 'DEEPINFRA_API_KEY'
  };

  const envKey = keyMap[provider];

  // Check if authorized (dev mode or has auth token)
  const useServerKeys = process.env.NODE_ENV === 'development' ||
                       (process.env.AUTH_TOKEN &&
                        clientKeys.OPENAI_API_KEY === process.env.AUTH_TOKEN);

  return useServerKeys ? process.env[envKey] : clientKeys[envKey];
}

// Model configurations with latest models
export const modelConfigs = {
  // Anthropic models - Claude series (newest to oldest)
  'claude-opus-4.6': {
    provider: 'anthropic',
    modelName: 'claude-opus-4-6',
    displayName: 'Opus 4.6',
    color: '#D97757',
    maxOutputTokens: 64000,
    cost: { input: 5.00, output: 25.00 }, // per million tokens
  },
  'claude-opus-4.5': {
    provider: 'anthropic',
    modelName: 'claude-opus-4-5',
    displayName: 'Opus 4.5',
    color: '#D97757',
    maxOutputTokens: 64000,
    cost: { input: 5.00, output: 25.00 }, // per million tokens
  },
  'claude-sonnet-4.6': {
    provider: 'anthropic',
    modelName: 'claude-sonnet-4-6',
    displayName: 'Sonnet 4.6',
    color: '#D97757',
    maxOutputTokens: 64000,
    cost: { input: 3.00, output: 15.00 }, // per million tokens
  },
  'claude-sonnet-4.5': {
    provider: 'anthropic',
    modelName: 'claude-sonnet-4-5',
    displayName: 'Sonnet 4.5',
    color: '#D97757',
    maxOutputTokens: 64000,
    cost: { input: 3.00, output: 15.00 }, // per million tokens
  },
  'claude-haiku-4.5': {
    provider: 'anthropic',
    modelName: 'claude-haiku-4-5',
    displayName: 'Haiku 4.5',
    color: '#D97757',
    maxOutputTokens: 64000,
    cost: { input: 1.00, output: 5.00 }, // per million tokens
  },
  'claude-opus-4.1': {
    provider: 'anthropic',
    modelName: 'claude-opus-4-1',
    displayName: 'Opus 4.1',
    color: '#D97757',
    legacy: true,
    maxOutputTokens: 32000,
    cost: { input: 15.00, output: 75.00 }, // per million tokens
  },
  'claude-sonnet-4': {
    provider: 'anthropic',
    modelName: 'claude-sonnet-4-20250514',
    displayName: 'Sonnet 4',
    color: '#D97757',
    legacy: true,
    maxOutputTokens: 64000,
    cost: { input: 3.00, output: 15.00 }, // per million tokens
  },
  'claude-opus-4': {
    provider: 'anthropic',
    modelName: 'claude-opus-4-20250514',
    displayName: 'Opus 4',
    color: '#D97757',
    legacy: true,
    maxOutputTokens: 32000,
    cost: { input: 15.00, output: 75.00 }, // per million tokens
  },
  'claude-sonnet-3.7': {
    provider: 'anthropic',
    modelName: 'claude-3-7-sonnet-20250219',
    displayName: 'Sonnet 3.7',
    color: '#D97757',
    legacy: true,
    maxOutputTokens: 64000,
    cost: { input: 3.00, output: 15.00 }, // per million tokens
  },
  'claude-haiku-3': {
    provider: 'anthropic',
    modelName: 'claude-3-haiku-20240307',
    displayName: 'Haiku 3',
    color: '#D97757',
    legacy: true,
    maxOutputTokens: 4096,
    cost: { input: 0.25, output: 1.25 }, // per million tokens
  },

  // OpenAI models
  'o3': {
    provider: 'openai',
    modelName: 'o3',
    displayName: 'o3',
    color: '#10A37F',
    legacy: true,
    cost: { input: 2.00, output: 8.00 }, // per million tokens
  },
  'o4-mini': {
    provider: 'openai',
    modelName: 'o4-mini',
    displayName: 'o4 Mini',
    color: '#10A37F',
    legacy: true,
    cost: { input: 4.00, output: 16.00 }, // per million tokens
  },
  'gpt-5.2': {
    provider: 'openai',
    modelName: 'gpt-5.2',
    displayName: 'GPT-5.2',
    color: '#10A37F',
    cost: { input: 1.25, output: 10.00 }, // per million tokens
  },
  'gpt-5.1': {
    provider: 'openai',
    modelName: 'gpt-5.1',
    displayName: 'GPT-5.1',
    color: '#10A37F',
    legacy: true,
    cost: { input: 1.25, output: 10.00 }, // per million tokens
  },
  'gpt-5': {
    provider: 'openai',
    modelName: 'gpt-5',
    displayName: 'GPT-5',
    color: '#10A37F',
    legacy: true,
    cost: { input: 1.25, output: 10.00 }, // per million tokens
  },
  'gpt-5-mini': {
    provider: 'openai',
    modelName: 'gpt-5-mini',
    displayName: 'GPT-5 Mini',
    color: '#10A37F',
    cost: { input: 0.25, output: 2.00 }, // per million tokens
  },
  'gpt-5-nano': {
    provider: 'openai',
    modelName: 'gpt-5-nano',
    displayName: 'GPT-5 Nano',
    color: '#10A37F',
    cost: { input: 0.05, output: 0.40 }, // per million tokens
  },
  'gpt-4o': {
    provider: 'openai',
    modelName: 'gpt-4o',
    displayName: 'GPT-4o',
    color: '#10A37F',
    legacy: true,
    cost: { input: 2.50, output: 10.00 }, // per million tokens
  },
  'gpt-4o-mini': {
    provider: 'openai',
    modelName: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    color: '#10A37F',
    legacy: true,
    cost: { input: 0.15, output: 0.60 }, // per million tokens
  },
  'gpt-3.5-turbo': {
    provider: 'openai',
    modelName: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    color: '#10A37F',
    legacy: true,
    cost: { input: 0.50, output: 1.50 }, // per million tokens
  },

  // Google models - Gemini 2.5 & 3 series
  'gemini-3-pro': {
    provider: 'google',
    modelName: 'gemini-3-pro-preview',
    displayName: 'Gemini 3 Pro',
    color: '#EA580C',
    cost: { input: 2.00, output: 12.00 }, // per million tokens
  },
  'gemini-3-flash': {
    provider: 'google',
    modelName: 'gemini-3-flash-preview',
    displayName: 'Gemini 3 Flash',
    color: '#EA580C',
    cost: { input: 0.50, output: 3.00 }, // per million tokens
  },
  'gemini-2.5-pro': {
    provider: 'google',
    modelName: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    color: '#EA580C',
    legacy: true,
    minThinkingBudget: 128, // Pro cannot disable thinking
    cost: { input: 1.25, output: 10.00 }, // per million tokens
  },
  'gemini-2.5-flash': {
    provider: 'google',
    modelName: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    color: '#EA580C',
    legacy: true,
    cost: { input: 0.15, output: 2.50 }, // per million tokens (thinking mode)
  },
  'gemini-2.5-flash-lite': {
    provider: 'google',
    modelName: 'gemini-2.5-flash-lite',
    displayName: 'Gemini 2.5 Flash Lite',
    color: '#EA580C',
    cost: { input: 0.10, output: 0.40 }, // per million tokens
  },
  /*'gemini-2.0-flash': {
    provider: 'google',
    modelName: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    color: '#EA580C',
    legacy: true,
    cost: { input: 0.10, output: 0.40 }, // per million tokens
  },
  'gemini-2.0-flash-lite': {
    provider: 'google',
    modelName: 'gemini-2.0-flash-lite',
    displayName: 'Gemini 2.0 Flash Lite',
    color: '#EA580C',
    legacy: true,
    cost: { input: 0.075, output: 0.30 }, // per million tokens
  },*/

  // xAI models - Grok series
  'grok-4': {
    provider: 'xai',
    modelName: 'grok-4-0709',
    displayName: 'Grok 4',
    color: '#1DA1F2',
    baseURL: 'https://api.x.ai/v1',
    cost: { input: 3.00, output: 15.00 }, // per million tokens
  },
  'grok-4-1-fast-reasoning': {
    provider: 'xai',
    modelName: 'grok-4-1-fast-reasoning',
    displayName: 'Grok 4.1 Fast (Reasoning)',
    color: '#1DA1F2',
    baseURL: 'https://api.x.ai/v1',
    cost: { input: 0.20, output: 0.50 }, // per million tokens
  },
  'grok-4-1-fast-non-reasoning': {
    provider: 'xai',
    modelName: 'grok-4-1-fast-non-reasoning',
    displayName: 'Grok 4.1 Fast',
    color: '#1DA1F2',
    baseURL: 'https://api.x.ai/v1',
    cost: { input: 0.20, output: 0.50 }, // per million tokens
  },
  'grok-3': {
    provider: 'xai',
    modelName: 'grok-3',
    displayName: 'Grok 3',
    color: '#1DA1F2',
    baseURL: 'https://api.x.ai/v1',
    legacy: true,
    cost: { input: 3.00, output: 15.00 }, // per million tokens
  },
  'grok-3-mini': {
    provider: 'xai',
    modelName: 'grok-3-mini',
    displayName: 'Grok 3 Mini',
    color: '#1DA1F2',
    baseURL: 'https://api.x.ai/v1',
    legacy: true,
    cost: { input: 0.30, output: 0.50 }, // per million tokens
  },

  // Meta models - Llama series (via DeepInfra)
  'llama-4-maverick': {
    provider: 'deepinfra',
    modelName: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
    displayName: 'Llama 4 Maverick',
    color: '#3B82F6',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.20, output: 0.60 }, // per million tokens
  },
  'llama-4-scout': {
    provider: 'deepinfra',
    modelName: 'meta-llama/Llama-4-Scout-17B-16E-Instruct',
    displayName: 'Llama 4 Scout',
    color: '#3B82F6',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.10, output: 0.30 }, // per million tokens
  },
  'llama-3.3-70b': {
    provider: 'deepinfra',
    modelName: 'meta-llama/Llama-3.3-70B-Instruct',
    displayName: 'Llama 3.3 70B',
    color: '#3B82F6',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    legacy: true,
    cost: { input: 0.23, output: 0.40 }, // per million tokens
  },

  // DeepSeek models (via DeepInfra)
  'deepseek-v3.2-exp': {
    provider: 'deepinfra',
    modelName: 'deepseek-ai/DeepSeek-V3.2-Exp',
    displayName: 'DeepSeek V3.2 Exp',
    color: '#8B5CF6',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.27, output: 0.40 }, // per million tokens
  },
  'deepseek-v3.1-terminus': {
    provider: 'deepinfra',
    modelName: 'deepseek-ai/DeepSeek-V3.1-Terminus',
    displayName: 'DeepSeek V3.1 Terminus',
    color: '#8B5CF6',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    legacy: true,
    cost: { input: 0.216, output: 0.27 }, // per million tokens
  },
  'deepseek-v3': {
    provider: 'deepinfra',
    modelName: 'deepseek-ai/DeepSeek-V3',
    displayName: 'DeepSeek V3',
    color: '#8B5CF6',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    legacy: true,
    cost: { input: 0.27, output: 1.10 }, // per million tokens
  },
  'deepseek-r1': {
    provider: 'deepinfra',
    modelName: 'deepseek-ai/DeepSeek-R1-Turbo',
    displayName: 'DeepSeek R1',
    color: '#8B5CF6',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.55, output: 2.19 }, // per million tokens
  },

  // Qwen models (via DeepInfra)
  'qwen3-next-80b-instruct': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3-Next-80B-A3B-Instruct',
    displayName: 'Qwen3 Next 80B Instruct',
    color: '#22C55E',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.09, output: 1.10 }, // per million tokens
  },
  'qwen3-235b-a22b-thinking': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3-235B-A22B-Thinking-2507',
    displayName: 'Qwen3 235B A22B Thinking',
    color: '#22C55E',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.30, output: 2.90 }, // per million tokens
  },
  'qwen3-235b-a22b': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
    displayName: 'Qwen3 235B A22B',
    color: '#22C55E',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.13, output: 0.60 }, // per million tokens
  },
  'qwen3-32b': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3-32B',
    displayName: 'Qwen3 32B',
    color: '#22C55E',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.10, output: 0.30 }, // per million tokens
  },
  'qwen3-30b-a3b': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3-30B-A3B',
    displayName: 'Qwen3 30B A3B',
    color: '#22C55E',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.08, output: 0.29 }, // per million tokens
  },
  'qwen3-14b': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3-14B',
    displayName: 'Qwen3 14B',
    color: '#22C55E',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.08, output: 0.24 }, // per million tokens
  },
  'qwen2.5-72b': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen2.5-72B-Instruct',
    displayName: 'Qwen 2.5 72B',
    color: '#22C55E',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    legacy: true,
    cost: { input: 0.12, output: 0.39 }, // per million tokens
  },

  // Moonshot models (via DeepInfra)
  'kimi-k2-instruct': {
    provider: 'deepinfra',
    modelName: 'moonshotai/Kimi-K2-Instruct-0905',
    displayName: 'Kimi K2 Instruct',
    color: '#EC4899',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.40, output: 0.50 }, // per million tokens
  },

  // Zhipu AI models (via DeepInfra)
  'glm-4.7': {
    provider: 'deepinfra',
    modelName: 'zai-org/GLM-4.7',
    displayName: 'GLM-4.7',
    color: '#F59E0B',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.43, output: 1.75 }, // per million tokens
  },
  'glm-4.6': {
    provider: 'deepinfra',
    modelName: 'zai-org/GLM-4.6',
    displayName: 'GLM-4.6',
    color: '#F59E0B',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    legacy: true,
    cost: { input: 0.45, output: 1.90 }, // per million tokens
  },

  // NVIDIA models (via DeepInfra)
  'nemotron-3-nano': {
    provider: 'deepinfra',
    modelName: 'nvidia/Nemotron-3-Nano-30B-A3B',
    displayName: 'Nemotron 3 Nano',
    color: '#76B900',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.06, output: 0.24 }, // per million tokens
  },

  // MiniMax models (via DeepInfra)
  'minimax-m2': {
    provider: 'deepinfra',
    modelName: 'MiniMaxAI/MiniMax-M2',
    displayName: 'MiniMax M2',
    color: '#6366F1',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.254, output: 1.02 }, // per million tokens
  },

  // Mistral models (via DeepInfra)
  'mistral-small-3.2': {
    provider: 'deepinfra',
    modelName: 'mistralai/Mistral-Small-3.2-24B-Instruct-2506',
    displayName: 'Mistral Small 3.2',
    color: '#FF7000',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.075, output: 0.20 }, // per million tokens
  },
  'mistral-small-24b': {
    provider: 'deepinfra',
    modelName: 'mistralai/Mistral-Small-24B-Instruct-2501',
    displayName: 'Mistral Small 24B',
    color: '#FF7000',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.05, output: 0.08 }, // per million tokens
  },
  'mistral-nemo': {
    provider: 'deepinfra',
    modelName: 'mistralai/Mistral-Nemo-Instruct-2407',
    displayName: 'Mistral Nemo',
    color: '#FF7000',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.02, output: 0.04 }, // per million tokens
  },
  'mistral-8x7b': {
    provider: 'deepinfra',
    modelName: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    displayName: 'Mixtral 8x7B',
    color: '#FF7000',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    legacy: true,
    cost: { input: 0.54, output: 0.54 }, // per million tokens
  },

  // Open Source GPT models (via DeepInfra)
  'gpt-oss-120b': {
    provider: 'deepinfra',
    modelName: 'openai/gpt-oss-120b',
    displayName: 'GPT-OSS 120B',
    color: '#6B7280',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.05, output: 0.45 }, // per million tokens
  },
  'gpt-oss-20b': {
    provider: 'deepinfra',
    modelName: 'openai/gpt-oss-20b',
    displayName: 'GPT-OSS 20B',
    color: '#6B7280',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.04, output: 0.15 }, // per million tokens
  },

};

// Get available models grouped by provider
export function getAvailableModels({ includeLegacy = false } = {}) {
  const grouped = {};
  for (const [key, config] of Object.entries(modelConfigs)) {
    // Skip legacy models unless includeLegacy is true
    if (config.legacy && !includeLegacy) continue;

    const provider = config.provider;
    if (!grouped[provider]) {
      grouped[provider] = [];
    }
    grouped[provider].push({
      id: key,
      ...config
    });
  }
  return grouped;
}

// Strip inline thinking tags from response (some models like Qwen output <think>...</think> in text)
// Returns { content, thinking } where thinking is the extracted text or null
function stripThinking(response) {
  if (!response) return { content: response, thinking: null };
  const thinkingRegex = /<think>([\s\S]*?)<\/think>/g;
  const matches = [...response.matchAll(thinkingRegex)];
  const thinking = matches.length > 0 ? matches.map(m => m[1]).join('\n') : null;
  const content = response.replace(thinkingRegex, '').trim();
  return { content, thinking };
}

// Estimate token count (rough approximation)
export function estimateTokens(text) {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

// Calculate cost for a message (legacy - uses text estimation)
export function calculateCost(model, inputText, outputText) {
  const config = modelConfigs[model];
  if (!config?.cost) return null;

  const inputTokens = estimateTokens(inputText);
  const outputTokens = estimateTokens(outputText);

  const inputCost = (inputTokens / 1000000) * config.cost.input;
  const outputCost = (outputTokens / 1000000) * config.cost.output;

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    formatted: `$${(inputCost + outputCost).toFixed(6)}`
  };
}

// Calculate cost from actual usage data returned by API
export function calculateCostFromUsage(model, usage) {
  if (!usage) return null;
  const config = modelConfigs[model];
  if (!config?.cost) return null;

  const { inputTokens = 0, outputTokens = 0, thinkingTokens = 0 } = usage;

  const inputCost = (inputTokens / 1000000) * config.cost.input;
  // Thinking tokens are typically charged at output rate
  const outputCost = ((outputTokens + thinkingTokens) / 1000000) * config.cost.output;
  const totalCost = inputCost + outputCost;

  return {
    inputTokens,
    outputTokens,
    thinkingTokens,
    totalTokens: inputTokens + outputTokens + thinkingTokens,
    totalCost,
    formatted: `$${totalCost.toFixed(6)}`
  };
}

// Build input text from conversation history
export function buildInputText(messages, systemPrompt) {
  let text = systemPrompt || '';

  messages.forEach(msg => {
    if (msg.role === 'user') {
      text += '\n' + msg.content;
    } else if (msg.role === 'assistant') {
      if (msg.responses) {
        // Multi-model response - combine successful responses
        msg.responses.forEach(r => {
          if (r.success) {
            text += '\n' + r.response;
          }
        });
      } else if (msg.content) {
        text += '\n' + msg.content;
      }
    }
  });

  return text;
}

// Calculate total cost for a conversation
export function calculateConversationCost(messages, systemPrompt = '') {
  let totalCost = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  const modelCosts = {};

  messages.forEach((msg, index) => {
    if (msg.role === 'assistant' && msg.responses) {
      // Multi-model response
      const priorMessages = messages.slice(0, index);
      const inputText = buildInputText(priorMessages, systemPrompt);

      msg.responses.forEach(response => {
        if (response.success && response.response) {
          const cost = calculateCost(response.model, inputText, response.response);
          if (cost) {
            if (!modelCosts[response.model]) {
              modelCosts[response.model] = { cost: 0, tokens: 0 };
            }
            modelCosts[response.model].cost += cost.totalCost;
            modelCosts[response.model].tokens += cost.totalTokens;
            totalCost += cost.totalCost;
            totalInputTokens += cost.inputTokens;
            totalOutputTokens += cost.outputTokens;
          }
        }
      });
    } else if (msg.role === 'synthesis' && msg.model) {
      // Synthesis message - input is the prior model responses
      const priorMessage = messages[index - 1];
      let synthesisInput = '';

      if (priorMessage?.responses) {
        priorMessage.responses.forEach(r => {
          if (r.success) {
            synthesisInput += r.response + '\n';
          }
        });
      }

      const cost = calculateCost(msg.model, synthesisInput, msg.content);
      if (cost) {
        if (!modelCosts[msg.model]) {
          modelCosts[msg.model] = { cost: 0, tokens: 0 };
        }
        modelCosts[msg.model].cost += cost.totalCost;
        modelCosts[msg.model].tokens += cost.totalTokens;
        totalCost += cost.totalCost;
        totalInputTokens += cost.inputTokens;
        totalOutputTokens += cost.outputTokens;
      }
    }
  });

  return {
    totalCost,
    totalInputTokens,
    totalOutputTokens,
    totalTokens: totalInputTokens + totalOutputTokens,
    modelCosts,
    formatted: `$${totalCost.toFixed(6)}`
  };
}

// Main LLM call function
export async function callLLM({
  messages,
  model,
  temperature = 0.7,
  systemPrompt = null,
  stream = false,
  apiKeys = {},
  reasoning = null, // 'off', 'low', 'medium', 'high' - controls thinking budget for supported models
}) {
  const config = modelConfigs[model];
  if (!config) {
    throw new Error(`Unknown model: ${model}`);
  }

  // Add system prompt if provided
  const finalMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const startTime = Date.now();

  try {
    const apiKey = getApiKey(config.provider, apiKeys);
    let result;

    switch (config.provider) {
      case 'anthropic':
        result = await callAnthropic({ messages: finalMessages, config, temperature, stream, apiKey, reasoning });
        break;
      case 'openai':
        result = await callOpenAI({ messages: finalMessages, config, temperature, stream, apiKey, reasoning });
        break;
      case 'google':
        result = await callGoogle({ messages: finalMessages, config, temperature, stream, apiKey, reasoning });
        break;
      case 'xai':
        result = await callOpenAICompatible({
          messages: finalMessages,
          config,
          temperature,
          stream,
          apiKey
        });
        break;
      case 'deepinfra':
        result = await callOpenAICompatible({
          messages: finalMessages,
          config,
          temperature,
          stream,
          apiKey
        });
        break;
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }

    const duration = Date.now() - startTime;

    // Handle streaming (returns body directly) vs non-streaming (returns { content, usage })
    if (stream) {
      return { content: result, duration };
    }

    return { content: result.content, duration, usage: result.usage };

  } catch (error) {
    console.error(`LLM call failed for ${model}:`, error.message);
    throw error;
  }
}

// Anthropic implementation
async function callAnthropic({ messages, config, temperature, stream, apiKey, reasoning }) {
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  // Extract system message if present
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const maxOutputTokens = config.maxOutputTokens || 8192;

  // Build request body
  const requestBody = {
    model: config.modelName,
    max_tokens: maxOutputTokens,
    stream,
    ...(systemMessage && { system: systemMessage.content }),
    messages: userMessages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }))
  };

  // Extended thinking supported on Claude 3.7+ (model name contains claude-3-7, claude-sonnet-4, claude-opus-4, claude-haiku-4, etc.)
  const supportsThinking = /claude-(3-7|sonnet-4|opus-4|haiku-4)/.test(config.modelName);

  // Handle extended thinking - when enabled, temperature is not compatible
  if (supportsThinking && reasoning && reasoning !== 'off') {
    let budgetTokens;
    switch (reasoning) {
      case 'low':
        budgetTokens = 1024; // Minimum allowed
        break;
      case 'medium':
        budgetTokens = 10000;
        break;
      case 'high':
        budgetTokens = 32000;
        break;
      default:
        budgetTokens = 1024;
    }

    // budget_tokens must be less than max_tokens
    if (budgetTokens >= maxOutputTokens) {
      budgetTokens = Math.floor(maxOutputTokens * 0.6);
    }

    requestBody.thinking = {
      type: 'enabled',
      budget_tokens: budgetTokens,
    };
    // Temperature is not compatible with extended thinking
  } else {
    requestBody.temperature = temperature;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const data = await response.json();
    console.error('Anthropic API error:', JSON.stringify(data, null, 2));
    throw new Error(data.error?.message || 'Anthropic API error');
  }

  if (stream) {
    return response.body;
  }

  const data = await response.json();

  // Handle response - may contain thinking blocks followed by text blocks
  const textBlock = data.content?.find(block => block.type === 'text');
  const thinkingBlock = data.content?.find(block => block.type === 'thinking');

  if (thinkingBlock) {
    console.log(`${config.displayName || config.modelName} THINKING: ${thinkingBlock.thinking?.substring(0, 500)}...`);
  }

  // Extract usage info
  const usage = {
    inputTokens: data.usage?.input_tokens || 0,
    outputTokens: data.usage?.output_tokens || 0,
  };

  return { content: textBlock?.text || '', usage };
}

// OpenAI implementation
async function callOpenAI({ messages, config, temperature, stream, apiKey, reasoning }) {
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const requestBody = {
    model: config.modelName,
    messages,
    stream
  };

  const isOSeries = config.modelName.startsWith('o');
  const isGPT5 = config.modelName.startsWith('gpt-5');

  // Handle different model types
  if (isOSeries || isGPT5) {
    // O-series (o1, o3, o4) and GPT-5 models use 'reasoning_effort' parameter
    // They don't support custom temperature
    if (reasoning && reasoning !== 'off') {
      requestBody.reasoning_effort = reasoning;
    }
  } else {
    // Older models (GPT-4o, GPT-3.5) support temperature
    requestBody.temperature = temperature;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || 'OpenAI API error');
  }

  if (stream) {
    return response.body;
  }

  const data = await response.json();

  // Log reasoning content if present (for o-series models)
  if (data.choices?.[0]?.message?.reasoning_content) {
    console.log(`${config.displayName || config.modelName} THINKING: ${data.choices[0].message.reasoning_content.substring(0, 500)}...`);
  }

  // Extract usage info (OpenAI uses prompt_tokens/completion_tokens, plus reasoning_tokens for o-series)
  const usage = {
    inputTokens: data.usage?.prompt_tokens || 0,
    outputTokens: data.usage?.completion_tokens || 0,
    thinkingTokens: data.usage?.reasoning_tokens || 0,
  };

  return { content: data.choices?.[0]?.message?.content || '', usage };
}

// Google Gemini implementation
async function callGoogle({ messages, config, temperature, stream, apiKey, reasoning }) {
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY not configured');
  }

  // Convert messages to Gemini format
  const systemMessage = messages.find(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');

  // Build contents array for Gemini
  const contents = conversationMessages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // If there's a system message, prepend it to the first user message
  if (systemMessage && contents.length > 0) {
    if (contents[0].role === 'user') {
      contents[0].parts[0].text = `${systemMessage.content}\n\n${contents[0].parts[0].text}`;
    } else {
      // Add system message as a user message if first message is from assistant
      contents.unshift({
        role: 'user',
        parts: [{ text: systemMessage.content }]
      });
    }
  }

  // Build generation config
  const generationConfig = {
    temperature
  };

  // Handle thinking config for Gemini 2.5+ models
  const isGemini3 = config.modelName.includes('gemini-3');
  const isGemini25 = config.modelName.includes('gemini-2.5') || config.modelName.includes('2.5');
  const supportsThinking = isGemini3 || isGemini25;

  if (supportsThinking && reasoning && reasoning !== 'off') {

    if (isGemini3) {
      // Gemini 3 uses thinkingLevel (LOW, MEDIUM, HIGH)
      // Note: Gemini 3 cannot disable thinking - LOW is the minimum
      const levelMap = { low: 'LOW', medium: 'MEDIUM', high: 'HIGH' };
      generationConfig.thinkingConfig = {
        thinkingLevel: levelMap[reasoning] || 'LOW',
        includeThoughts: true  // Request thought summaries in response
      };
    } else {
      // Gemini 2.5 uses thinkingBudget (token count)
      const budgetMap = { low: 1024, medium: 8192, high: config.modelName.includes('pro') ? 32768 : 24576 };
      let thinkingBudget = budgetMap[reasoning] || 1024;

      // Apply minimum budget for Pro models (they cannot disable thinking)
      if (config.minThinkingBudget && thinkingBudget < config.minThinkingBudget) {
        thinkingBudget = config.minThinkingBudget;
      }

      generationConfig.thinkingConfig = {
        thinkingBudget,
        includeThoughts: true  // Request thought summaries in response
      };
    }
  }

  const endpoint = stream ? 'streamGenerateContent' : 'generateContent';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.modelName}:${endpoint}?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig
      })
    }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || 'Google API error');
  }

  if (stream) {
    return response.body;
  }

  const data = await response.json();

  // Gemini may return multiple parts - find text and thinking parts
  // When includeThoughts is true, parts with thought=true contain thought summaries
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textPart = parts.find(p => p.text && !p.thought);
  const thinkingPart = parts.find(p => p.thought === true && p.text);

  if (thinkingPart?.text) {
    console.log(`${config.displayName || config.modelName} THINKING: ${thinkingPart.text.substring(0, 500)}...`);
  }

  // Extract usage info (Gemini uses usageMetadata with different field names)
  const usage = {
    inputTokens: data.usageMetadata?.promptTokenCount || 0,
    outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
    thinkingTokens: data.usageMetadata?.thoughtsTokenCount || 0,
  };

  const content = textPart?.text || parts.find(p => p.text && !p.thought)?.text || parts[0]?.text || '';
  return { content, usage };
}

// OpenAI-compatible endpoints (xAI, DeepInfra)
async function callOpenAICompatible({ messages, config, temperature, stream, apiKey }) {
  if (!apiKey) {
    throw new Error(`API key not configured for ${config.provider}`);
  }

  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: config.modelName,
      messages,
      temperature,
      stream
    })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || `${config.provider} API error`);
  }

  if (stream) {
    return response.body;
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '';

  // Strip inline thinking tags (e.g., from Qwen, DeepSeek R1)
  const { content, thinking } = stripThinking(rawContent);

  if (thinking) {
    console.log(`${config.displayName || config.modelName} THINKING: ${thinking.substring(0, 500)}...`);
  }

  // Extract usage info (OpenAI-compatible format)
  const usage = {
    inputTokens: data.usage?.prompt_tokens || 0,
    outputTokens: data.usage?.completion_tokens || 0,
  };

  return { content, usage };
}

// Call multiple LLMs in parallel
export async function callMultipleLLMs({
  messages,
  models,
  temperature = 0.7,
  systemPrompt = null,
  apiKeys = {},
  reasoning = null,
}) {
  const promises = models.map(model =>
    callLLM({ messages, model, temperature, systemPrompt, apiKeys, reasoning })
      .then(({ content, duration, usage }) => ({
        model,
        response: content,
        duration,
        usage,
        success: true
      }))
      .catch(error => ({
        model,
        error: error.message,
        success: false,
        duration: 0
      }))
  );

  return await Promise.all(promises);
}

// Get synthesis model with fallback if requested model isn't available
function getSynthesisModel(requestedModel, apiKeys = {}) {
  // Preferred models for synthesis (in priority order)
  const preferredModels = [
    requestedModel,          // User's choice first
    'gemini-2.5-flash',      // Primary default
    'gpt-5-mini',            // OpenAI fallback
    'claude-sonnet-4.5',       // Anthropic fallback
    'llama-4-maverick',      // Open model fallback
  ].filter(Boolean);  // Remove null/undefined

  // Find first available model
  for (const modelId of preferredModels) {
    const config = modelConfigs[modelId];
    if (config && getApiKey(config.provider, apiKeys)) {
      return modelId;
    }
  }

  // Last resort: any available model
  for (const [modelId, config] of Object.entries(modelConfigs)) {
    if (getApiKey(config.provider, apiKeys)) {
      return modelId;
    }
  }

  throw new Error('No API keys configured for synthesis');
}

// Synthesize responses from multiple LLMs
export async function synthesizeResponses({
  responses,
  synthesisModel = 'gemini-2.5-flash',  // Default to Gemini 2.5 Flash
  synthesisPrompt = null,
  apiKeys = {},
}) {
  // Use requested model if available, otherwise fallback
  const model = getSynthesisModel(synthesisModel, apiKeys);
  const defaultPrompt = `You are a synthesis assistant. Multiple AI models have provided responses to the same question.
Your task is to synthesize these responses into a single, comprehensive answer that captures the key insights from all models.

Be objective and highlight:
1. Common agreements across models
2. Unique insights from specific models
3. Any disagreements or different perspectives
4. A balanced conclusion

Keep the synthesis concise but thorough.`;

  const responsesText = responses
    .filter(r => r.success)
    .map(r => `**${modelConfigs[r.model].displayName}:**\n${r.response}`)
    .join('\n\n---\n\n');

  const messages = [
    {
      role: 'user',
      content: `Please synthesize these responses:\n\n${responsesText}`
    }
  ];

  const result = await callLLM({
    messages,
    model,  // Use the auto-selected or specified model
    temperature: 0.3,
    systemPrompt: synthesisPrompt || defaultPrompt,
    apiKeys,
  });

  return result.content;
}
