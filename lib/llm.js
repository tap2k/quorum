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
  // Anthropic models - Claude 4 series
  'claude-opus-4': {
    provider: 'anthropic',
    modelName: 'claude-opus-4-1',
    displayName: 'Claude Opus 4',
    color: '#D97757',
    cost: { input: 3.00, output: 15.00 }, // per million tokens
  },
  'claude-sonnet-4': {
    provider: 'anthropic',
    modelName: 'claude-sonnet-4-0',
    displayName: 'Claude Sonnet 4',
    color: '#D97757',
    cost: { input: 3.00, output: 15.00 }, // per million tokens
  },
  
  // OpenAI models - GPT-5 series
  'gpt-5': {
    provider: 'openai',
    modelName: 'gpt-5',
    displayName: 'GPT-5',
    color: '#10A37F',
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
    cost: { input: 0.50, output: 0.40 }, // per million tokens
  },

  // Google models - Gemini 2.5 series
  'gemini-2.5-pro': {
    provider: 'google',
    modelName: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    color: '#EA580C',
    cost: { input: 1.25, output: 10.00 }, // per million tokens
  },
  'gemini-2.5-flash': {
    provider: 'google',
    modelName: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    color: '#EA580C',
    cost: { input: 0.15, output: 2.50 }, // per million tokens (thinking mode)
  },
  'gemini-2.5-flash-lite': {
    provider: 'google',
    modelName: 'gemini-2.5-flash-lite',
    displayName: 'Gemini 2.5 Flash Lite',
    color: '#EA580C',
    cost: { input: 0.10, output: 0.40 }, // per million tokens
  },

  // xAI models - Grok series
  'grok-4': {
    provider: 'xai',
    modelName: 'grok-4',
    displayName: 'Grok 4',
    color: '#1DA1F2',
    baseURL: 'https://api.x.ai/v1',
    cost: { input: 3.00, output: 15.00 }, // per million tokens
  },
  'grok-4-fast-reasoning': {
    provider: 'xai',
    modelName: 'grok-4-fast-reasoning',
    displayName: 'Grok 4 Fast (Reasoning)',
    color: '#1DA1F2',
    baseURL: 'https://api.x.ai/v1',
    cost: { input: 0.20, output: 0.50 }, // per million tokens
  },
  'grok-4-fast-non-reasoning': {
    provider: 'xai',
    modelName: 'grok-4-fast-non-reasoning',
    displayName: 'Grok 4 Fast',
    color: '#1DA1F2',
    baseURL: 'https://api.x.ai/v1',
    cost: { input: 0.20, output: 0.50 }, // per million tokens
  },

  // Meta models - Llama 4 series (via DeepInfra)
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

  // DeepSeek models (via DeepInfra)
  'deepseek-v3.1-terminus': {
    provider: 'deepinfra',
    modelName: 'deepseek-ai/DeepSeek-V3.1-Terminus',
    displayName: 'DeepSeek V3.1 Terminus',
    color: '#8B5CF6',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.216, output: 0.27 }, // per million tokens
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
  'qwen3-next-80b-thinking': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3-Next-80B-A3B-Thinking',
    displayName: 'Qwen3 Next 80B Thinking',
    color: '#22C55E',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.14, output: 1.40 }, // per million tokens
  },
  'qwen3-next-80b-instruct': {
    provider: 'deepinfra',
    modelName: 'Qwen/Qwen3-Next-80B-A3B-Instruct',
    displayName: 'Qwen3 Next 80B Instruct',
    color: '#22C55E',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    cost: { input: 0.14, output: 1.40 }, // per million tokens
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
export function getAvailableModels() {
  const grouped = {};
  for (const [key, config] of Object.entries(modelConfigs)) {
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

// Estimate token count (rough approximation)
export function estimateTokens(text) {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

// Calculate cost for a message
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
}) {
  const config = modelConfigs[model];
  if (!config) {
    throw new Error(`Unknown model: ${model}`);
  }

  // Add system prompt if provided
  const finalMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  try {
    const apiKey = getApiKey(config.provider, apiKeys);

    switch (config.provider) {
      case 'anthropic':
        return await callAnthropic({ messages: finalMessages, config, temperature, stream, apiKey });
      case 'openai':
        return await callOpenAI({ messages: finalMessages, config, temperature, stream, apiKey });
      case 'google':
        return await callGoogle({ messages: finalMessages, config, temperature, stream, apiKey });
      case 'xai':
        return await callOpenAICompatible({
          messages: finalMessages,
          config,
          temperature,
          stream,
          apiKey
        });
      case 'deepinfra':
        return await callOpenAICompatible({
          messages: finalMessages,
          config,
          temperature,
          stream,
          apiKey
        });
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  } catch (error) {
    console.error(`LLM call failed for ${model}:`, error.message);
    throw error;
  }
}

// Anthropic implementation
async function callAnthropic({ messages, config, temperature, stream, apiKey }) {
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  // Extract system message if present
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  // Set appropriate max_tokens based on model
  // Claude Opus 4: 32K max output
  // Claude Sonnet 4: 64K max output
  let maxTokens = 64000; // Default to Sonnet's limit
  if (config.modelName.includes('opus')) {
    maxTokens = 32000;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: config.modelName,
      max_tokens: maxTokens,  // Anthropic requires this parameter
      temperature,
      stream,
      ...(systemMessage && { system: systemMessage.content }),
      messages: userMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || 'Anthropic API error');
  }

  if (stream) {
    return response.body;
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

// OpenAI implementation
async function callOpenAI({ messages, config, temperature, stream, apiKey }) {
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // GPT-5 models don't support custom temperature
  const useTemperature = !config.modelName.startsWith('gpt-5');

  const requestBody = {
    model: config.modelName,
    messages,
    stream
  };

  // Only add temperature if the model supports it
  if (useTemperature) {
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
  return data.choices?.[0]?.message?.content || '';
}

// Google Gemini implementation
async function callGoogle({ messages, config, temperature, stream, apiKey }) {
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
        generationConfig: {
          temperature
        }
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
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
  return data.choices?.[0]?.message?.content || '';
}

// Call multiple LLMs in parallel
export async function callMultipleLLMs({
  messages,
  models,
  temperature = 0.7,
  systemPrompt = null,
  apiKeys = {},
}) {
  const promises = models.map(model =>
    callLLM({ messages, model, temperature, systemPrompt, apiKeys })
      .then(response => ({ model, response, success: true }))
      .catch(error => ({ model, error: error.message, success: false }))
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
    'claude-sonnet-4',       // Anthropic fallback
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

  return await callLLM({
    messages,
    model,  // Use the auto-selected or specified model
    temperature: 0.3,
    systemPrompt: synthesisPrompt || defaultPrompt,
    apiKeys,
  });
}