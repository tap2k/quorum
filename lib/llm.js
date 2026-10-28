// Multi-LLM service for Quorum - conduct conversations with multiple LLMs simultaneously
// Supports: Anthropic, OpenAI, Google Gemini, xAI (Grok), Meta (Muse), and DeepInfra-hosted open models

// Log reasoning/thinking content only when DEBUG_LLM=1 — keeps server logs clean by default.
function debugLog(...args) {
  if (process.env.DEBUG_LLM) {
    console.log(...args);
  }
}

// Per provider: env var holding its key, label in the API key settings, the OpenAI-style
// endpoint for providers served through callResponses or callOpenAICompatible, whether it has
// a native web search tool, and the fee per search in USD (2026-10-18 price pages; left out
// where none is published). Models of providers without webSearch answer without it.
export const PROVIDERS = [
  { provider: 'anthropic', envKey: 'ANTHROPIC_API_KEY', label: 'Anthropic (Claude)', webSearch: true, searchFee: 0.01 },
  { provider: 'openai', envKey: 'OPENAI_API_KEY', label: 'OpenAI (GPT)', baseURL: 'https://api.openai.com/v1', webSearch: true, searchFee: 0.01 },
  { provider: 'google', envKey: 'GOOGLE_API_KEY', label: 'Google (Gemini)', webSearch: true, searchFee: 0.014 }, // after 5,000 free a month
  { provider: 'xai', envKey: 'XAI_API_KEY', label: 'xAI (Grok)', baseURL: 'https://api.x.ai/v1', webSearch: true, searchFee: 0.005 },
  { provider: 'deepinfra', envKey: 'DEEPINFRA_API_KEY', label: 'DeepInfra', baseURL: 'https://api.deepinfra.com/v1/openai' },
  { provider: 'meta', envKey: 'META_API_KEY', label: 'Meta (Muse)', baseURL: 'https://api.meta.ai/v1', webSearch: true },
];

const providerInfo = provider => PROVIDERS.find(p => p.provider === provider) || {};
export const supportsWebSearch = model => !!providerInfo(modelConfigs[model]?.provider).webSearch;

// What a model searched for and the pages it got back, or null if it did not search.
// A page listed twice keeps whichever listing has a title.
function searchSummary(queries, sources) {
  const byUrl = new Map();
  for (const { url, title } of sources) {
    if (url) byUrl.set(url, { url, title: title || byUrl.get(url)?.title });
  }
  return queries.length || byUrl.size ? { queries, sources: [...byUrl.values()] } : null;
}

// Helper function to get API key with fallback to environment variables
function getApiKey(provider, clientKeys = {}) {
  const { envKey } = providerInfo(provider);

  // Check if authorized (dev mode or has auth token)
  const useServerKeys = process.env.NODE_ENV === 'development' ||
                       (process.env.AUTH_TOKEN &&
                        clientKeys.OPENAI_API_KEY === process.env.AUTH_TOKEN);

  return useServerKeys ? process.env[envKey] : clientKeys[envKey];
}

// Model configurations with latest models
export const modelConfigs = {
  // Anthropic models - Claude series (newest to oldest)
  'claude-fable-5.1': {
    provider: 'anthropic',
    modelName: 'claude-fable-5-1',
    displayName: 'Fable 5.1',
    color: '#D97757',
    maxOutputTokens: 128000,
    maxChars: 4000000,
    cost: { input: 10.00, output: 50.00 }, // per million tokens
  },
  'claude-fable-5': {
    provider: 'anthropic',
    modelName: 'claude-fable-5',
    displayName: 'Fable 5',
    color: '#D97757',
    legacy: true,
    maxOutputTokens: 128000,
    maxChars: 4000000,
    cost: { input: 10.00, output: 50.00 }, // per million tokens
  },
  'claude-mythos-5': {
    provider: 'anthropic',
    modelName: 'claude-mythos-5',
    displayName: 'Mythos 5',
    color: '#D97757',
    maxOutputTokens: 128000,
    maxChars: 4000000,
    cost: { input: 10.00, output: 50.00 }, // per million tokens
  },
  'claude-opus-5.5': {
    provider: 'anthropic',
    modelName: 'claude-opus-5-5',
    displayName: 'Opus 5.5',
    color: '#D97757',
    maxOutputTokens: 128000,
    maxChars: 4000000,
    cost: { input: 4.00, output: 20.00 }, // per million tokens
  },
  'claude-opus-5': {
    provider: 'anthropic',
    modelName: 'claude-opus-5',
    displayName: 'Opus 5',
    color: '#D97757',
    legacy: true,
    maxOutputTokens: 128000,
    maxChars: 4000000,
    cost: { input: 5.00, output: 25.00 }, // per million tokens
  },
  'claude-opus-4.8': {
    provider: 'anthropic',
    modelName: 'claude-opus-4-8',
    displayName: 'Opus 4.8',
    color: '#D97757',
    legacy: true,
    maxOutputTokens: 64000,
    maxChars: 800000,
    cost: { input: 5.00, output: 25.00 }, // per million tokens
  },
  'claude-opus-4.7': {
    provider: 'anthropic',
    modelName: 'claude-opus-4-7',
    displayName: 'Opus 4.7',
    color: '#D97757',
    legacy: true,
    maxOutputTokens: 64000,
    maxChars: 800000,
    cost: { input: 5.00, output: 25.00 }, // per million tokens
  },
  'claude-opus-4.6': {
    provider: 'anthropic',
    modelName: 'claude-opus-4-6',
    displayName: 'Opus 4.6',
    color: '#D97757',
    legacy: true,
    maxOutputTokens: 64000,
    maxChars: 800000,
    cost: { input: 5.00, output: 25.00 }, // per million tokens
  },
  'claude-opus-4.5': {
    provider: 'anthropic',
    modelName: 'claude-opus-4-5',
    displayName: 'Opus 4.5',
    color: '#D97757',
    legacy: true,
    maxOutputTokens: 64000,
    maxChars: 800000,
    cost: { input: 5.00, output: 25.00 }, // per million tokens
  },
  'claude-sonnet-5.5': {
    provider: 'anthropic',
    modelName: 'claude-sonnet-5-5',
    displayName: 'Sonnet 5.5',
    color: '#D97757',
    maxOutputTokens: 128000,
    maxChars: 4000000,
    cost: { input: 2.00, output: 10.00 }, // per million tokens
  },
  'claude-sonnet-5': {
    provider: 'anthropic',
    modelName: 'claude-sonnet-5',
    displayName: 'Sonnet 5',
    color: '#D97757',
    legacy: true,
    maxOutputTokens: 128000,
    maxChars: 4000000,
    cost: { input: 3.00, output: 15.00 }, // per million tokens
  },
  'claude-sonnet-4.6': {
    provider: 'anthropic',
    modelName: 'claude-sonnet-4-6',
    displayName: 'Sonnet 4.6',
    legacy: true,
    color: '#D97757',
    maxOutputTokens: 64000,
    maxChars: 800000,
    cost: { input: 3.00, output: 15.00 }, // per million tokens
  },
  'claude-sonnet-4.5': {
    provider: 'anthropic',
    modelName: 'claude-sonnet-4-5',
    displayName: 'Sonnet 4.5',
    color: '#D97757',
    legacy: true,
    maxOutputTokens: 64000,
    maxChars: 800000,
    cost: { input: 3.00, output: 15.00 }, // per million tokens
  },
  'claude-haiku-5.5': {
    provider: 'anthropic',
    modelName: 'claude-haiku-5-5',
    displayName: 'Haiku 5.5',
    color: '#D97757',
    maxOutputTokens: 128000,
    maxChars: 4000000,
    cost: { input: 0.10, output: 0.50 }, // per million tokens (prompts up to 100k; $0.50/$2.50 over 100k)
  },
  'claude-haiku-4.5': {
    provider: 'anthropic',
    modelName: 'claude-haiku-4-5',
    displayName: 'Haiku 4.5',
    color: '#D97757',
    legacy: true,
    maxOutputTokens: 64000,
    maxChars: 800000,
    cost: { input: 1.00, output: 5.00 }, // per million tokens
  },

  // OpenAI models
  'gpt-6-astra': {
    provider: 'openai',
    modelName: 'gpt-6-astra',
    displayName: 'GPT-6 Astra',
    color: '#10A37F',
    maxOutputTokens: 128000,
    maxChars: 4200000,
    cost: { input: 10.00, output: 50.00 }, // per million tokens
  },
  'gpt-6.1-sol': {
    provider: 'openai',
    modelName: 'gpt-6.1-sol',
    displayName: 'GPT-6.1 Sol',
    color: '#10A37F',
    maxOutputTokens: 128000,
    maxChars: 4200000, // 1.05M token context
    cost: { input: 2.00, output: 10.00 }, // per million tokens
  },
  'gpt-6-sol': {
    provider: 'openai',
    modelName: 'gpt-6-sol',
    displayName: 'GPT-6 Sol',
    color: '#10A37F',
    legacy: true,
    maxOutputTokens: 128000,
    maxChars: 4200000, // 1.05M token context
    cost: { input: 2.00, output: 10.00 }, // per million tokens
  },
  'gpt-6-luna': {
    provider: 'openai',
    modelName: 'gpt-6-luna',
    displayName: 'GPT-6 Luna',
    color: '#10A37F',
    maxOutputTokens: 128000,
    maxChars: 4200000, // 1.05M token context
    cost: { input: 0.10, output: 0.50 }, // per million tokens
  },
  'gpt-5.6-luna': {
    provider: 'openai',
    modelName: 'gpt-5.6-luna',
    displayName: 'GPT-5.6 Luna',
    color: '#10A37F',
    legacy: true,
    maxChars: 4200000,
    cost: { input: 0.20, output: 1.20 }, // per million tokens
  },
  'gpt-5.6-terra': {
    provider: 'openai',
    modelName: 'gpt-5.6-terra',
    displayName: 'GPT-5.6 Terra',
    color: '#10A37F',
    maxChars: 4200000,
    cost: { input: 2.00, output: 12.00 }, // per million tokens
  },
  'gpt-5.6-sol': {
    provider: 'openai',
    modelName: 'gpt-5.6-sol', // alias: gpt-5.6
    displayName: 'GPT-5.6 Sol',
    color: '#10A37F',
    legacy: true,
    maxChars: 4200000,
    cost: { input: 4.00, output: 20.00 }, // per million tokens
  },
  'gpt-5.5': {
    provider: 'openai',
    modelName: 'gpt-5.5',
    displayName: 'GPT-5.5',
    color: '#10A37F',
    legacy: true,
    maxChars: 4200000,
    cost: { input: 5.00, output: 30.00 }, // per million tokens
  },
  'gpt-5.4': {
    provider: 'openai',
    modelName: 'gpt-5.4',
    displayName: 'GPT-5.4',
    color: '#10A37F',
    legacy: true,
    maxChars: 4200000,
    cost: { input: 2.50, output: 15.00 }, // per million tokens
  },
  'gpt-5.4-mini': {
    provider: 'openai',
    modelName: 'gpt-5.4-mini',
    displayName: 'GPT-5.4 Mini',
    legacy: true,
    color: '#10A37F',
    maxChars: 1600000,
    cost: { input: 0.75, output: 4.50 }, // per million tokens
  },
  'gpt-5.4-nano': {
    provider: 'openai',
    modelName: 'gpt-5.4-nano',
    displayName: 'GPT-5.4 Nano',
    legacy: true,
    color: '#10A37F',
    maxChars: 1600000,
    cost: { input: 0.20, output: 1.25 }, // per million tokens
  },
  'gpt-5.2': {
    provider: 'openai',
    modelName: 'gpt-5.2',
    displayName: 'GPT-5.2',
    color: '#10A37F',
    legacy: true,
    maxChars: 1600000,
    cost: { input: 1.25, output: 10.00 }, // per million tokens
  },
  'gpt-5.1': {
    provider: 'openai',
    modelName: 'gpt-5.1',
    displayName: 'GPT-5.1',
    color: '#10A37F',
    legacy: true,
    maxChars: 1600000,
    cost: { input: 1.25, output: 10.00 }, // per million tokens
  },
  'gpt-5': {
    provider: 'openai',
    modelName: 'gpt-5',
    displayName: 'GPT-5',
    color: '#10A37F',
    legacy: true,
    maxChars: 1600000,
    cost: { input: 1.25, output: 10.00 }, // per million tokens
  },
  'gpt-5-mini': {
    provider: 'openai',
    modelName: 'gpt-5-mini',
    displayName: 'GPT-5 Mini',
    color: '#10A37F',
    legacy: true,
    maxChars: 1600000,
    cost: { input: 0.25, output: 2.00 }, // per million tokens
  },
  'gpt-5-nano': {
    provider: 'openai',
    modelName: 'gpt-5-nano',
    displayName: 'GPT-5 Nano',
    color: '#10A37F',
    legacy: true,
    maxChars: 1600000,
    cost: { input: 0.05, output: 0.40 }, // per million tokens
  },
  'o3': {
    provider: 'openai',
    modelName: 'o3',
    displayName: 'o3',
    legacy: true,
    color: '#10A37F',
    maxChars: 400000,
    cost: { input: 2.00, output: 8.00 }, // per million tokens
  },
  'gpt-4o': {
    provider: 'openai',
    modelName: 'gpt-4o',
    displayName: 'GPT-4o',
    legacy: true,
    color: '#10A37F',
    maxChars: 512000,
    cost: { input: 2.50, output: 10.00 }, // per million tokens
  },
  'gpt-4o-mini': {
    provider: 'openai',
    modelName: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    color: '#10A37F',
    legacy: true,
    maxChars: 512000,
    cost: { input: 0.15, output: 0.60 }, // per million tokens
  },

  // Google models - Gemini 2.5, 3 & 4 series
  'gemini-4-argon': {
    provider: 'google',
    modelName: 'gemini-4-argon',
    displayName: 'Gemini 4 Argon',
    color: '#EA580C',
    maxChars: 1000000,
    cost: { input: 4.00, output: 20.00 }, // per million tokens (after intro period; promo $2/$10)
  },
  'gemini-3.1-pro': {
    provider: 'google',
    modelName: 'gemini-3.1-pro-preview',
    displayName: 'Gemini 3.1 Pro',
    color: '#EA580C',
    maxChars: 1000000,
    cost: { input: 2.00, output: 12.00 }, // per million tokens
  },
  'gemini-3.5-flash-lite': {
    provider: 'google',
    modelName: 'gemini-3.5-flash-lite',
    displayName: 'Gemini 3.5 Flash Lite',
    color: '#EA580C',
    maxChars: 1000000,
    cost: { input: 0.30, output: 2.50 }, // per million tokens
  },
  'gemini-3.8-flash': {
    provider: 'google',
    modelName: 'gemini-3.8-flash',
    displayName: 'Gemini 3.8 Flash',
    color: '#EA580C',
    maxChars: 1000000,
    cost: { input: 1.50, output: 7.50 }, // per million tokens (from Jan 1, 2027; promo $0.75/$3.75 through 2026)
  },
  'gemini-3.6-flash': {
    provider: 'google',
    modelName: 'gemini-3.6-flash',
    displayName: 'Gemini 3.6 Flash',
    color: '#EA580C',
    legacy: true,
    maxChars: 1000000,
    cost: { input: 1.50, output: 7.50 }, // per million tokens
  },
  'gemini-3-flash': {
    provider: 'google',
    modelName: 'gemini-3-flash-preview',
    displayName: 'Gemini 3 Flash',
    legacy: true,
    color: '#EA580C',
    maxChars: 1000000,
    cost: { input: 0.50, output: 3.00 }, // per million tokens
  },
  'gemini-2.5-pro': {
    provider: 'google',
    modelName: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    color: '#EA580C',
    legacy: true,
    minThinkingBudget: 128, // Pro cannot disable thinking
    maxChars: 1000000,
    cost: { input: 1.25, output: 10.00 }, // per million tokens
  },
  'gemini-2.5-flash': {
    provider: 'google',
    modelName: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    legacy: true,
    color: '#EA580C',
    maxChars: 1000000,
    cost: { input: 0.15, output: 2.50 }, // per million tokens (thinking mode)
  },
  'gemini-2.5-flash-lite': {
    provider: 'google',
    modelName: 'gemini-2.5-flash-lite',
    displayName: 'Gemini 2.5 Flash Lite',
    legacy: true,
    color: '#EA580C',
    maxChars: 1000000,
    cost: { input: 0.10, output: 0.40 }, // per million tokens
  },

  // Meta models - Muse series (direct via Meta Model API)
  'muse-wonder-1.0': {
    provider: 'meta',
    modelName: 'muse-wonder-1.0',
    displayName: 'Muse Wonder',
    color: '#0064E0',
    maxChars: 4200000, // 1,048,576 token context
    cost: { input: 4.00, output: 20.00 }, // per million tokens, standard tier (no contributor mode)
  },
  'muse-spark-1.3': {
    provider: 'meta',
    modelName: 'muse-spark-1.3',
    displayName: 'Muse Spark 1.3',
    color: '#0064E0',
    maxChars: 4200000, // 1,048,576 token context
    cost: { input: 1.25, output: 4.25 }, // per million tokens, standard tier
  },

  'muse-glimmer-30b': {
    provider: 'deepinfra',
    modelName: 'meta-models/Muse-Glimmer-30B',
    displayName: 'Muse Glimmer 30B',
    color: '#0064E0',
    maxChars: 524288, // 128k token context
    cost: { input: 0.30, output: 1.20 }, // per million tokens
  },

  // xAI models - Grok series
  'grok-4.7': {
    provider: 'xai',
    modelName: 'grok-4.7',
    displayName: 'Grok 4.7',
    color: '#1DA1F2',
    maxChars: 2000000, // 500k token context
    cost: { input: 2.00, output: 6.00 }, // per million tokens; $4.00/$12.00 above 200k-token prompts
  },
  'grok-4.6': {
    provider: 'xai',
    modelName: 'grok-4.6',
    displayName: 'Grok 4.6',
    color: '#1DA1F2',
    legacy: true,
    maxChars: 2000000, // 500k token context
    cost: { input: 2.00, output: 6.00 }, // per million tokens
  },
  'grok-4.5': {
    provider: 'xai',
    modelName: 'grok-4.5',
    displayName: 'Grok 4.5',
    color: '#1DA1F2',
    legacy: true,
    maxChars: 2000000,
    cost: { input: 2.00, output: 6.00 }, // per million tokens
  },
  'grok-4.3': {
    provider: 'xai',
    modelName: 'grok-4.3',
    displayName: 'Grok 4.3',
    legacy: true,
    color: '#1DA1F2',
    maxChars: 4000000,
    cost: { input: 1.25, output: 2.50 }, // per million tokens
  },
  'grok-4.20-beta-reasoning': {
    provider: 'xai',
    modelName: 'grok-4.20-0309-reasoning',
    displayName: 'Grok 4.20 (Reasoning)',
    legacy: true,
    color: '#1DA1F2',
    maxChars: 2000000,
    cost: { input: 2.00, output: 6.00 }, // per million tokens
  },
  'grok-4.20-beta': {
    provider: 'xai',
    modelName: 'grok-4.20-0309-non-reasoning',
    displayName: 'Grok 4.20',
    legacy: true,
    color: '#1DA1F2',
    maxChars: 2000000,
    cost: { input: 2.00, output: 2.00 }, // per million tokens
  },

  // Meta models - Llama series (via DeepInfra)
  'llama-4-scout': {
    provider: 'deepinfra',
    modelName: 'meta-llama/Llama-4-Scout-17B-16E-Instruct',
    displayName: 'Llama 4 Scout',
    color: '#3B82F6',
    maxChars: 40000000,
    cost: { input: 0.10, output: 0.30 }, // per million tokens
  },
  'llama-3.3-70b': {
    provider: 'deepinfra',
    modelName: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    displayName: 'Llama 3.3 70B',
    legacy: true,
    color: '#3B82F6',
    maxChars: 524288,
    cost: { input: 0.10, output: 0.32 }, // per million tokens
  },

  // DeepSeek models (via DeepInfra)
  'deepseek-v4-pro': {
    provider: 'deepinfra',
    modelName: 'deepseek-ai/DeepSeek-V4-Pro',
    displayName: 'DeepSeek V4 Pro',
    color: '#8B5CF6',
    maxChars: 4000000,
    cost: { input: 1.3, output: 2.6 }, // per million tokens
  },
  'deepseek-v4.1-flash': {
    provider: 'deepinfra',
    modelName: 'deepseek-ai/DeepSeek-V4.1-Flash',
    displayName: 'DeepSeek V4.1 Flash',
    color: '#8B5CF6',
    maxChars: 4000000,
    cost: { input: 0.20, output: 0.60 }, // per million tokens
  },
  'deepseek-v4-flash': {
    provider: 'deepinfra',
    modelName: 'deepseek-ai/DeepSeek-V4-Flash',
    displayName: 'DeepSeek V4 Flash',
    color: '#8B5CF6',
    legacy: true,
    maxChars: 1000000,
    cost: { input: 0.09, output: 0.18 }, // per million tokens
  },
  'deepseek-v3': {
    provider: 'deepinfra',
    modelName: 'deepseek-ai/DeepSeek-V3',
    displayName: 'DeepSeek V3',
    color: '#8B5CF6',
    legacy: true,
    maxChars: 512000,
    cost: { input: 0.32, output: 0.89 }, // per million tokens
  },

  // Qwen models (via DeepInfra)
  'qwen3-next-80b-instruct': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3-Next-80B-A3B-Instruct',
    displayName: 'Qwen3 Next 80B Instruct',
    legacy: true,
    color: '#22C55E',
    maxChars: 1048576,
    cost: { input: 0.09, output: 1.10 }, // per million tokens
  },
  'qwen3-235b-a22b': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
    displayName: 'Qwen3 235B A22B',
    legacy: true,
    color: '#22C55E',
    maxChars: 1048576,
    cost: { input: 0.09, output: 0.55 }, // per million tokens
  },
  'qwen3-32b': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3-32B',
    displayName: 'Qwen3 32B',
    legacy: true,
    color: '#22C55E',
    maxChars: 524288,
    cost: { input: 0.08, output: 0.28 }, // per million tokens
  },
  'qwen3-30b-a3b': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3-30B-A3B',
    displayName: 'Qwen3 30B A3B',
    legacy: true,
    color: '#22C55E',
    maxChars: 524288,
    cost: { input: 0.12, output: 0.5 }, // per million tokens
  },
  'qwen3-14b': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3-14B',
    displayName: 'Qwen3 14B',
    legacy: true,
    color: '#22C55E',
    maxChars: 131072,
    cost: { input: 0.12, output: 0.24 }, // per million tokens
  },
  // Qwen3.5 models (via DeepInfra)
  'qwen3.5-397b-a17b': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3.5-397B-A17B',
    displayName: 'Qwen3.5 397B A17B',
    color: '#22C55E',
    legacy: true,
    maxChars: 1048576,
    cost: { input: 0.45, output: 3.0 }, // per million tokens
  },
  'qwen3.5-35b-a3b': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3.5-35B-A3B',
    displayName: 'Qwen3.5 35B A3B',
    legacy: true,
    color: '#22C55E',
    maxChars: 1048576,
    cost: { input: 0.14, output: 1.0 }, // per million tokens
  },
  'qwen3.6-35b-a3b': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3.6-35B-A3B',
    displayName: 'Qwen3.6 35B A3B',
    color: '#22C55E',
    maxChars: 1048576,
    cost: { input: 0.1, output: 0.95 }, // per million tokens
  },
  'qwen3.5-27b': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3.5-27B',
    displayName: 'Qwen3.5 27B',
    color: '#22C55E',
    maxChars: 1048576,
    cost: { input: 0.26, output: 2.60 }, // per million tokens
  },
  'qwen3.5-9b': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3.5-9B',
    displayName: 'Qwen3.5 9B',
    color: '#22C55E',
    maxChars: 1048576,
    cost: { input: 0.1, output: 0.15 }, // per million tokens
  },

  'qwen2.5-72b': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen2.5-72B-Instruct',
    displayName: 'Qwen 2.5 72B',
    color: '#22C55E',
    legacy: true,
    maxChars: 131072,
    cost: { input: 0.36, output: 0.4 }, // per million tokens
  },

  // Moonshot models (via DeepInfra)
  'kimi-k3': {
    provider: 'deepinfra',
    modelName: 'moonshotai/Kimi-K3',
    displayName: 'Kimi K3',
    color: '#EC4899',
    maxChars: 1024000,
    cost: { input: 2.85, output: 14.25 }, // per million tokens
  },
  'kimi-k2.6': {
    provider: 'deepinfra',
    modelName: 'moonshotai/Kimi-K2.6',
    displayName: 'Kimi K2.6',
    color: '#EC4899',
    legacy: true,
    maxChars: 1024000,
    cost: { input: 0.75, output: 3.50 }, // per million tokens
  },

  // Zhipu AI models (via DeepInfra)
  'glm-5.3-flash': {
    provider: 'deepinfra',
    modelName: 'zai-org/GLM-5.3-Flash',
    displayName: 'GLM-5.3 Flash',
    color: '#F59E0B',
    maxChars: 4000000,
    cost: { input: 0.15, output: 0.50 }, // per million tokens
  },
  'glm-5.3': {
    provider: 'deepinfra',
    modelName: 'zai-org/GLM-5.3',
    displayName: 'GLM-5.3',
    color: '#F59E0B',
    maxChars: 4000000,
    cost: { input: 1.40, output: 4.40 }, // per million tokens
  },
  'glm-5.2': {
    provider: 'deepinfra',
    modelName: 'zai-org/GLM-5.2',
    displayName: 'GLM-5.2',
    color: '#F59E0B',
    legacy: true,
    maxChars: 4000000,
    cost: { input: 0.75, output: 2.4 }, // per million tokens
  },
  'glm-4.7': {
    provider: 'deepinfra',
    modelName: 'zai-org/GLM-4.7',
    displayName: 'GLM-4.7',
    color: '#F59E0B',
    maxChars: 800000,
    cost: { input: 0.40, output: 1.75 }, // per million tokens
  },
  'glm-4.6': {
    provider: 'deepinfra',
    modelName: 'zai-org/GLM-4.6',
    displayName: 'GLM-4.6',
    color: '#F59E0B',
    legacy: true,
    maxChars: 800000,
    cost: { input: 0.5, output: 2.0 }, // per million tokens
  },

  // Google Gemma models (via DeepInfra)
  'gemma-4-31b': {
    provider: 'deepinfra',
    modelName: 'google/gemma-4-31B-it',
    displayName: 'Gemma 4 31B',
    color: '#4285F4',
    maxChars: 1024000,
    cost: { input: 0.13, output: 0.38 }, // per million tokens
  },
  'gemma-4-26b-a4b': {
    provider: 'deepinfra',
    modelName: 'google/gemma-4-26B-A4B-it',
    displayName: 'Gemma 4 26B A4B',
    color: '#4285F4',
    maxChars: 1024000,
    cost: { input: 0.07, output: 0.34 }, // per million tokens
  },
  'gemma-3-27b': {
    provider: 'deepinfra',
    modelName: 'google/gemma-3-27b-it',
    displayName: 'Gemma 3 27B',
    legacy: true,
    color: '#4285F4',
    maxChars: 524288,
    cost: { input: 0.08, output: 0.16 }, // per million tokens
  },
  'gemma-3-12b': {
    provider: 'deepinfra',
    modelName: 'google/gemma-3-12b-it',
    displayName: 'Gemma 3 12B',
    legacy: true,
    color: '#4285F4',
    maxChars: 524288,
    cost: { input: 0.05, output: 0.15 }, // per million tokens
  },
  'gemma-3-4b': {
    provider: 'deepinfra',
    modelName: 'google/gemma-3-4b-it',
    displayName: 'Gemma 3 4B',
    legacy: true,
    color: '#4285F4',
    maxChars: 524288,
    cost: { input: 0.05, output: 0.1 }, // per million tokens
  },

  // NVIDIA models (via DeepInfra)
  'nemotron-3.5-super-vl': {
    provider: 'deepinfra',
    modelName: 'nvidia/NVIDIA-Nemotron-3.5-Super-VL',
    displayName: 'Nemotron 3.5 Super VL',
    color: '#76B900',
    maxChars: 1048576,
    cost: { input: 0.2, output: 1.0 }, // per million tokens
  },

  // MiniMax models (via DeepInfra)
  'minimax-m3': {
    provider: 'deepinfra',
    modelName: 'MiniMaxAI/MiniMax-M3',
    displayName: 'MiniMax M3',
    color: '#6366F1',
    maxChars: 2097152,
    cost: { input: 0.28, output: 1.1 }, // per million tokens
  },

  // Mistral models (via DeepInfra)
  'mistral-small-3.2': {
    provider: 'deepinfra',
    modelName: 'mistralai/Mistral-Small-3.2-24B-Instruct-2506',
    displayName: 'Mistral Small 3.2',
    color: '#FF7000',
    maxChars: 512000,
    cost: { input: 0.075, output: 0.20 }, // per million tokens
  },
  'mistral-small-24b': {
    provider: 'deepinfra',
    modelName: 'mistralai/Mistral-Small-24B-Instruct-2501',
    displayName: 'Mistral Small 24B',
    legacy: true,
    color: '#FF7000',
    maxChars: 512000,
    cost: { input: 0.05, output: 0.08 }, // per million tokens
  },
  'mistral-nemo': {
    provider: 'deepinfra',
    modelName: 'mistralai/Mistral-Nemo-Instruct-2407',
    displayName: 'Mistral Nemo',
    color: '#FF7000',
    maxChars: 512000,
    cost: { input: 0.019, output: 0.03 }, // per million tokens
  },

  // NousResearch models (via DeepInfra)
  'hermes-3-405b': {
    provider: 'deepinfra',
    modelName: 'NousResearch/Hermes-3-Llama-3.1-405B',
    displayName: 'Hermes 3 405B',
    color: '#14B8A6',
    maxChars: 524288,
    cost: { input: 1.00, output: 1.00 }, // per million tokens
  },
  'hermes-3-70b': {
    provider: 'deepinfra',
    modelName: 'NousResearch/Hermes-3-Llama-3.1-70B',
    displayName: 'Hermes 3 70B',
    color: '#14B8A6',
    maxChars: 524288,
    cost: { input: 0.70, output: 0.70 }, // per million tokens
  },

  // Gryphe models (via DeepInfra)
  'mythomax-l2-13b': {
    provider: 'deepinfra',
    modelName: 'Gryphe/MythoMax-L2-13b',
    displayName: 'MythoMax L2 13B',
    color: '#A855F7',
    maxChars: 16384,
    cost: { input: 0.40, output: 0.40 }, // per million tokens
  },

  // Open Source GPT models (via DeepInfra)
  'gpt-oss-120b': {
    provider: 'deepinfra',
    modelName: 'openai/gpt-oss-120b',
    displayName: 'GPT-OSS 120B',
    color: '#6B7280',
    maxChars: 512000,
    cost: { input: 0.037, output: 0.17 }, // per million tokens
  },
  'gpt-oss-20b': {
    provider: 'deepinfra',
    modelName: 'openai/gpt-oss-20b',
    displayName: 'GPT-OSS 20B',
    color: '#6B7280',
    maxChars: 512000,
    cost: { input: 0.03, output: 0.14 }, // per million tokens
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

// Compute how close an input is to a model's input character limit
export function getContextUsage(model, text) {
  const config = modelConfigs[model];
  if (!config?.maxChars) return null;
  const chars = text?.length || 0;
  const ratio = chars / config.maxChars;
  return {
    chars,
    maxChars: config.maxChars,
    ratio,
    overLimit: ratio >= 1,
    nearLimit: ratio >= 0.8,
  };
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

  const { inputTokens = 0, outputTokens = 0, thinkingTokens = 0, searches = 0 } = usage;

  const inputCost = (inputTokens / 1000000) * config.cost.input;
  // Thinking tokens are typically charged at output rate
  const outputCost = ((outputTokens + thinkingTokens) / 1000000) * config.cost.output;
  const totalCost = inputCost + outputCost + searches * (providerInfo(config.provider).searchFee || 0);

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
  webSearch = false, // let the model use its provider's own web search tool
}) {
  const config = modelConfigs[model];
  if (!config) {
    throw new Error(`Unknown model: ${model}`);
  }
  // Models without native search answer without it
  webSearch = webSearch && supportsWebSearch(model);

  // Add system prompt if provided
  const finalMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const startTime = Date.now();

  try {
    const apiKey = getApiKey(config.provider, apiKeys);
    let result;

    const args = { messages: finalMessages, config, temperature, stream, apiKey, reasoning, webSearch };
    switch (config.provider) {
      case 'anthropic':
        result = await callAnthropic(args);
        break;
      case 'openai':
        result = await callResponses(args);
        break;
      case 'google':
        result = await callGoogle(args);
        break;
      case 'xai':
      case 'deepinfra':
      case 'meta':
        // xAI and Meta offer web search only on their Responses APIs
        result = webSearch ? await callResponses(args) : await callOpenAICompatible(args);
        break;
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }

    const duration = Date.now() - startTime;

    // Handle streaming (returns body directly) vs non-streaming (returns { content, usage })
    if (stream) {
      return { content: result, duration };
    }

    return { ...result, thinking: result.thinking || null, search: result.search || null, duration };

  } catch (error) {
    console.error(`LLM call failed for ${model}:`, error.message);
    throw error;
  }
}

// Claude 4.6+ use adaptive thinking; budget_tokens is rejected from 4.7 on
const ADAPTIVE_THINKING = /claude-(opus-4-[6-8]|sonnet-4-6|opus-5|sonnet-5|haiku-5|fable|mythos)/;
// These think even when the thinking param is omitted
const THINKS_BY_DEFAULT = /claude-(opus-5|sonnet-5|haiku-5|fable|mythos)/;
// These reject temperature/top_p/top_k outright
const NO_SAMPLING_PARAMS = /claude-(opus-4-[78]|opus-5|sonnet-5|haiku-5|fable|mythos)/;

// Anthropic implementation
async function callAnthropic({ messages, config, temperature, stream, apiKey, reasoning, webSearch }) {
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

  const wantsThinking = reasoning && reasoning !== 'off';

  if (ADAPTIVE_THINKING.test(config.modelName)) {
    // Claude 4.6+ take adaptive thinking; effort sets depth. On 4.7+ the thinking
    // text is omitted unless display is 'summarized', so request it explicitly.
    if (wantsThinking || THINKS_BY_DEFAULT.test(config.modelName)) {
      requestBody.thinking = { type: 'adaptive', display: 'summarized' };
    }
    if (wantsThinking) {
      requestBody.output_config = { effort: reasoning };
    }
  } else if (/claude-(3-7|sonnet-4|opus-4|haiku-4)/.test(config.modelName) && wantsThinking) {
    // Older extended-thinking models take a fixed token budget
    const budgetMap = { low: 1024, medium: 10000, high: 32000 };
    let budgetTokens = budgetMap[reasoning] || 1024;

    // budget_tokens must be less than max_tokens
    if (budgetTokens >= maxOutputTokens) {
      budgetTokens = Math.floor(maxOutputTokens * 0.6);
    }

    requestBody.thinking = {
      type: 'enabled',
      budget_tokens: budgetTokens,
    };
  }

  // Temperature is incompatible with thinking and removed entirely on newer models
  if (!requestBody.thinking && !NO_SAMPLING_PARAMS.test(config.modelName)) {
    requestBody.temperature = temperature;
  }

  // The basic search tool: later versions filter results through code execution
  if (webSearch) {
    requestBody.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
  }

  const send = () => fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestBody)
  });

  const blocks = [];
  const usage = { inputTokens: 0, outputTokens: 0, searches: 0 };
  // A long search turn can come back paused; sending it back unchanged resumes it
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await send();

    if (!response.ok) {
      const data = await response.json();
      console.error('Anthropic API error:', JSON.stringify(data, null, 2));
      throw new Error(data.error?.message || 'Anthropic API error');
    }

    if (stream) {
      return response.body;
    }

    const data = await response.json();
    blocks.push(...(data.content || []));
    usage.inputTokens += data.usage?.input_tokens || 0;
    usage.outputTokens += data.usage?.output_tokens || 0;
    usage.searches += data.usage?.server_tool_use?.web_search_requests || 0;
    if (data.stop_reason !== 'pause_turn') break;
    requestBody.messages = [...requestBody.messages, { role: 'assistant', content: data.content }];
  }

  // With search, the answer is split into several text blocks around the search results
  const content = blocks.filter(block => block.type === 'text').map(block => block.text).join('');
  // Adaptive thinking can interleave several thinking blocks
  const thinking = blocks
    .filter(block => block.type === 'thinking' && block.thinking)
    .map(block => block.thinking)
    .join('\n\n') || null;

  if (thinking) {
    debugLog(`${config.displayName || config.modelName} THINKING: ${thinking.substring(0, 500)}...`);
  }

  const search = searchSummary(
    blocks.filter(b => b.type === 'server_tool_use' && b.name === 'web_search').map(b => b.input?.query),
    // An error result holds one error object instead of a list
    blocks.filter(b => b.type === 'web_search_tool_result' && Array.isArray(b.content))
      .flatMap(b => b.content),
  );

  return { content, thinking, search, usage };
}

// Responses API — OpenAI always (the only OpenAI endpoint that returns reasoning text, as
// summaries, for reasoning models), and xAI and Meta when web search is on, since their
// search tool is offered only here. All three return the same output items.
async function callResponses({ messages, config, temperature, stream, apiKey, reasoning, webSearch }) {
  if (!apiKey) {
    throw new Error(`API key not configured for ${config.provider}`);
  }

  const isOpenAI = config.provider === 'openai';
  const requestBody = {
    model: config.modelName,
    input: messages.map(({ role, content }) => ({ role, content })),
    stream
  };

  const isOSeries = isOpenAI && config.modelName.startsWith('o');
  const isReasoningGPT = isOpenAI && /^gpt-[5-9]/.test(config.modelName);
  const wantsReasoning = reasoning && reasoning !== 'off';

  if (isOSeries || isReasoningGPT) {
    // Reasoning models take effort instead of temperature. Summaries are opt-in.
    requestBody.reasoning = {
      summary: 'auto',
      ...(wantsReasoning && { effort: reasoning }),
    };
  } else {
    // Older OpenAI models (GPT-4o, GPT-3.5), Grok and Muse take temperature
    requestBody.temperature = temperature;
    if (!isOpenAI && wantsReasoning) {
      requestBody.reasoning = { effort: reasoning };
    }
  }

  if (webSearch) {
    requestBody.tools = [{ type: 'web_search' }];
    // OpenAI lists the pages each search returned only when asked; xAI lists them anyway
    if (isOpenAI) requestBody.include = ['web_search_call.action.sources'];
  }

  const { baseURL } = providerInfo(config.provider);
  const response = await fetch(`${baseURL}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || `${config.provider} API error`);
  }

  if (stream) {
    return response.body;
  }

  const data = await response.json();
  const output = data.output || [];

  // A model that searches can write several messages (a preamble, then the answer)
  const content = output
    .filter(item => item.type === 'message')
    .map(item => (item.content || [])
      .filter(part => part.type === 'output_text')
      .map(part => part.text)
      .join(''))
    .filter(Boolean)
    .join('\n\n');

  const thinking = output
    .filter(item => item.type === 'reasoning')
    .flatMap(item => item.summary || [])
    .map(part => part.text)
    .join('\n\n') || null;

  if (thinking) {
    debugLog(`${config.displayName || config.modelName} THINKING: ${thinking.substring(0, 500)}...`);
  }

  // A search call is either a search (query and, where listed, its result pages) or a page opened
  const searchCalls = output.filter(item => item.type === 'web_search_call').map(item => item.action || {});
  const searches = searchCalls.filter(action => action.type === 'search');
  const search = searchSummary(
    searches.map(action => action.query).filter(Boolean),
    [
      ...searchCalls.flatMap(action => action.sources || (action.url ? [{ url: action.url }] : [])),
      ...output.filter(item => item.type === 'message')
        .flatMap(item => item.content || [])
        .flatMap(part => part.annotations || [])
        .filter(a => a.type === 'url_citation'),
      // Grok titles its citations "1", "2", ...; a number is no title
    ].map(({ url, title }) => ({ url, title: /^\d+$/.test(title) ? undefined : title })),
  );

  // output_tokens includes reasoning tokens; split them so cost isn't double-counted
  const reasoningTokens = data.usage?.output_tokens_details?.reasoning_tokens || 0;
  const usage = {
    inputTokens: data.usage?.input_tokens || 0,
    outputTokens: (data.usage?.output_tokens || 0) - reasoningTokens,
    thinkingTokens: reasoningTokens,
    searches: searches.length,
  };

  return { content, thinking, search, usage };
}

// Google Gemini implementation
async function callGoogle({ messages, config, temperature, stream, apiKey, reasoning, webSearch }) {
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
  const usesThinkingLevel = /gemini-[34]/.test(config.modelName);
  const isGemini25 = config.modelName.includes('gemini-2.5') || config.modelName.includes('2.5');
  const supportsThinking = usesThinkingLevel || isGemini25;

  // Gemini thinks by default (3.x and 4 can't turn it off), but only returns thought
  // summaries when includeThoughts is set — so request them regardless of level.
  if (supportsThinking) {
    generationConfig.thinkingConfig = { includeThoughts: true };
  }

  if (supportsThinking && reasoning && reasoning !== 'off') {

    if (usesThinkingLevel) {
      // Gemini 3 and 4 use thinkingLevel (LOW, MEDIUM, HIGH)
      // Note: they cannot disable thinking - LOW is the minimum
      const levelMap = { low: 'LOW', medium: 'MEDIUM', high: 'HIGH' };
      generationConfig.thinkingConfig.thinkingLevel = levelMap[reasoning] || 'LOW';
    } else {
      // Gemini 2.5 uses thinkingBudget (token count)
      const budgetMap = { low: 1024, medium: 8192, high: config.modelName.includes('pro') ? 32768 : 24576 };
      let thinkingBudget = budgetMap[reasoning] || 1024;

      // Apply minimum budget for Pro models (they cannot disable thinking)
      if (config.minThinkingBudget && thinkingBudget < config.minThinkingBudget) {
        thinkingBudget = config.minThinkingBudget;
      }

      generationConfig.thinkingConfig.thinkingBudget = thinkingBudget;
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
        generationConfig,
        ...(webSearch && { tools: [{ google_search: {} }] })
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
  const thinking = parts.filter(p => p.thought === true && p.text).map(p => p.text).join('\n\n') || null;

  if (thinking) {
    debugLog(`${config.displayName || config.modelName} THINKING: ${thinking.substring(0, 500)}...`);
  }

  // Grounding sources link through Google redirects; their titles are the sites' domains
  const grounding = data.candidates?.[0]?.groundingMetadata;
  const queries = grounding?.webSearchQueries || [];
  const search = searchSummary(
    queries,
    (grounding?.groundingChunks || []).map(chunk => ({ url: chunk.web?.uri, title: chunk.web?.title })),
  );

  // Extract usage info (Gemini uses usageMetadata with different field names)
  const usage = {
    inputTokens: data.usageMetadata?.promptTokenCount || 0,
    outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
    thinkingTokens: data.usageMetadata?.thoughtsTokenCount || 0,
    searches: queries.length,
  };

  const content = parts.filter(p => p.text && !p.thought).map(p => p.text).join('');
  return { content, thinking, search, usage };
}

// OpenAI-compatible endpoints (xAI, DeepInfra, Meta)
async function callOpenAICompatible({ messages, config, temperature, stream, apiKey, reasoning }) {
  if (!apiKey) {
    throw new Error(`API key not configured for ${config.provider}`);
  }

  const requestBody = {
    model: config.modelName,
    messages,
    temperature,
    stream
  };

  // Forward reasoning effort to providers that accept it (xAI Grok 4.x, Meta Muse, DeepInfra gpt-oss, DeepSeek R1).
  // Models that don't support it silently ignore the field.
  if (reasoning && reasoning !== 'off') {
    requestBody.reasoning_effort = reasoning;
  }

  const { baseURL } = providerInfo(config.provider);
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
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

  // Some providers return reasoning in a structured field instead of inline tags
  const reasoningContent = data.choices?.[0]?.message?.reasoning_content
    || data.choices?.[0]?.message?.reasoning
    || thinking;

  if (reasoningContent) {
    debugLog(`${config.displayName || config.modelName} THINKING: ${reasoningContent.substring(0, 500)}...`);
  }

  const reasoningTokens = data.usage?.reasoning_tokens
    || data.usage?.completion_tokens_details?.reasoning_tokens
    || 0;

  if (reasoningTokens) {
    debugLog(`${config.displayName || config.modelName} reasoning tokens: ${reasoningTokens}`);
  }

  // Extract usage info (OpenAI-compatible format)
  const usage = {
    inputTokens: data.usage?.prompt_tokens || 0,
    outputTokens: data.usage?.completion_tokens || 0,
    thinkingTokens: reasoningTokens,
  };

  return { content, thinking: reasoningContent || null, usage };
}

// A multi-model assistant turn holds every model's reply, so it has to be turned back into a
// plain conversation before it can be sent to a model. There are two ways to do that, and which
// one you pick decides what the run measures.
//
// Turns a model has no reply for are dropped, which can leave two user turns adjacent; they are
// merged so roles still alternate.
function appendTurn(out, role, content) {
  const prev = out[out.length - 1];
  if (role === 'user' && prev?.role === 'user') {
    prev.content = `${prev.content}\n\n${content}`;
    return;
  }
  out.push({ role, content });
}

// Interview: the model sees only what it said itself.
function ownHistory(messages, model) {
  const out = [];
  for (const m of messages) {
    if (m.role === 'assistant' && m.responses) {
      const own = m.responses.find(r => r.model === model && r.success);
      if (own) appendTurn(out, 'assistant', own.response);
      continue;
    }
    appendTurn(out, m.role, m.content);
  }
  return out;
}

// Panel: every model reads the whole room, labelled by speaker, as its own prior speech.
function panelHistory(messages) {
  const out = [];
  for (const m of messages) {
    if (m.role === 'assistant' && m.responses) {
      const room = m.responses
        .filter(r => r.success)
        .map(r => `[${modelConfigs[r.model]?.displayName || r.model}]:\n${r.response}`)
        .join('\n\n---\n\n');
      if (room) appendTurn(out, 'assistant', room);
      continue;
    }
    appendTurn(out, m.role, m.content);
  }
  return out;
}

// Call multiple LLMs in parallel
export async function callMultipleLLMs({
  messages,
  models,
  temperature = 0.7,
  systemPrompt = null,
  apiKeys = {},
  reasoning = null,
  panelMode = false,
  webSearch = false,
}) {
  // In panel mode every model gets the same history, so build it once.
  // History is plain text either way, so a model does not keep its earlier search results.
  const shared = panelMode ? panelHistory(messages) : null;
  const promises = models.map(model =>
    callLLM({ messages: shared || ownHistory(messages, model), model, temperature, systemPrompt, apiKeys, reasoning, webSearch })
      .then(({ content, ...rest }) => ({
        model,
        response: content,
        ...rest,
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
    'gemini-3.8-flash',      // Primary default
    'gpt-6-luna',            // OpenAI fallback
    'claude-sonnet-5.5',     // Anthropic fallback
    'deepseek-v4-pro',       // Open model fallback
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
  synthesisModel = 'gemini-3.8-flash',  // Default to Gemini 3.8 Flash
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
