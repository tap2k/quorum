# Quorum — Agent / Codebase Guide

This file provides context for AI coding assistants (Claude Code, Cursor, Codex, etc.) and humans working in this repo. `CLAUDE.md` is a pointer to this file.

## Project Overview

**Quorum** is a multi-LLM conversation platform that enables users to:
- Conduct simultaneous conversations with multiple Large Language Models
- Compare responses from different AI providers side-by-side
- Customize system prompts for each conversation
- Synthesize insights from multiple AI responses
- ~70 current models (140 including legacy) across 25+ labs: direct (Anthropic, OpenAI, Google, xAI, Meta), DeepInfra-hosted open models, and every runnable modelun consensus-panel model via OpenRouter

## Development Commands

- `npm run dev` - Start development server with Next.js
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with Next.js configuration

## Environment Setup

Environment variables are configured in `.env` file (see `.env.example` for template):
- `ANTHROPIC_API_KEY` - Anthropic Claude API access
- `OPENAI_API_KEY` - OpenAI GPT models access
- `GOOGLE_API_KEY` - Google Gemini models access
- `XAI_API_KEY` - xAI Grok models access
- `DEEPINFRA_API_KEY` - DeepInfra gateway for Llama, DeepSeek, Qwen, Moonshot, Zhipu AI, Gemma, Mistral, GPT-OSS, and other open-source models
- `META_API_KEY` - Meta Model API (Muse series), OpenAI-compatible at `https://api.meta.ai/v1`
- `OPENROUTER_API_KEY` - OpenRouter: the panel models without another route, and the fallback for any model whose own provider key is unset
- `NEXT_PUBLIC_SITE_URL` - Site URL configuration (optional)
- `DEBUG_LLM` - When set, logs reasoning/thinking output from models to the server console (optional)

## Tech Stack

- **Frontend**: Next.js with Pages Router + Tailwind CSS v4
- **Backend**: API routes in Next.js
- **LLM Integration**: Direct API calls to multiple providers
- **Styling**: Tailwind CSS v4 with custom design system

## Architecture Overview

### Core Components

**lib/llm.js**
- Central LLM service module
- Handles API calls to all supported providers
- Model configuration and management
- Multi-LLM parallel execution
- Response synthesis functionality

**lib/panel-models.js** (generated; do not edit)
- Written by `node scripts/sync-panel.mjs [path/to/modelun]` from modelun's `studies/consensus/spec/models.txt` and `models.json` plus the live OpenRouter catalog
- Holds the runnable panel models (skips `not_run_after`, `unrunnable`, models missing from OpenRouter, and `host: deepinfra` models without a hand-written entry) and the OpenRouter id of every hand-written model OpenRouter serves
- Merged into `modelConfigs` over `handWrittenModels`; a hand-written entry wins and gains only `openrouter`, `pin`, `released` and the panel fields (`panel`, `family`, `origin`, `open`)
- A generated model older than its lab's current hand-written lineup is `legacy`
- Re-run when modelun's roster changes

**Routing** (`routeFor` in `lib/llm.js`): the model's own provider when its key is set, else OpenRouter under its `openrouter` id with modelun's provider `pin` (`allow_fallbacks: false`). Fallback replies carry `via: 'OpenRouter'`. Web search follows the route, so it is off through OpenRouter.

**pages/api/llm.js**
- API endpoint for LLM operations
- Supports single chat, multi-chat, and synthesis actions
- Error handling and response formatting

**pages/index.js**
- Main UI for multi-LLM conversations
- Model selection interface
- Conversation management
- System prompt configuration
- Temperature control
- Response display and synthesis

### Supported Models

Hand-written entries (pricing, context windows, provider routing, per-model quirks) live in [`lib/llm.js`](lib/llm.js) under `handWrittenModels`; `modelConfigs` adds the generated panel models. Highlights by provider:

- **Anthropic** — Claude Fable 5.1, Mythos 5, Opus 5.5, Sonnet 5.5, Haiku 5.5 (+ legacy Fable 5, Opus 5, Sonnet 5, Haiku 4.5, Opus 4.5–4.8, Sonnet 4.5–4.6)
- **OpenAI** — GPT-6 Astra, GPT-6.1 Sol, GPT-6 Luna, GPT-5.6 Terra
- **Google** — Gemini 4 Argon, 3.1 Pro, 3.8 Flash, 3.5 Flash Lite
- **xAI** — Grok 4.7
- **Meta** — Muse Wonder, Muse Spark 1.3 (direct via Meta Model API); Muse Glimmer 30B, Llama 4 Scout (via DeepInfra)
- **DeepSeek** (via DeepInfra) — V4 Pro, V4.1 Flash
- **Qwen** (via DeepInfra) — Qwen3.6 35B A3B, Qwen3.5 27B/9B
- **Moonshot** (via DeepInfra) — Kimi K3
- **Zhipu AI** (via DeepInfra) — GLM-5.3, GLM-5.3 Flash, GLM-4.7
- **Other open-source** (via DeepInfra) — Gemma 4, Mistral, Nemotron 3.5 Super VL, MiniMax M3, Hermes 3, GPT-OSS

Superseded models stay in `modelConfigs` behind a `legacy: true` flag, hidden from the default picker but still callable. DeepInfra pricing is synced from `https://api.deepinfra.com/v1/openai/models`, which reports live per-million rates.

Reasoning models (GPT-5+, Fable 5, Mythos 5, Opus 5/5.5, Sonnet 5/5.5, Haiku 5.5, Qwen Thinking, etc.) ignore `temperature` and use `reasoning_effort` instead — `lib/llm.js` handles this per-model.

## Feature Status

### ✅ Completed Features
- **Multi-LLM Conversations** - Query multiple models simultaneously
- **Model Selection UI** - A lab filter with one "Smaller open labs" group, search, and Reset (to `DEFAULT_MODELS`) / Clear
- **System Prompt Configuration** - Customizable system prompts for all models
- **Temperature Control** - Adjustable temperature parameter (0-1)
- **Response Synthesis** - AI-powered synthesis of multiple responses
- **Error Handling** - Graceful handling of API failures
- **Responsive Design** - Mobile-friendly interface
- **Cost Tracking** - Real-time cost estimation per model and total conversation
- **Latest Models** - Support for Claude 5, GPT-6, GPT-5.6, Gemini 3.x, Grok 4.7, Llama 4, etc.
- **Smart Parameter Handling** - Automatic handling of model-specific requirements
- **Web Search** - A "Web Search" checkbox in Settings lets each model use its provider's own search tool: Anthropic's server tool, OpenAI and xAI/Meta `web_search` on the Responses API (`callResponses`; xAI and Meta switch to it only when search is on), Gemini `google_search`. DeepInfra models answer without search. Each card shows the search count and a collapsible list of queries and sources; per-search fees (`searchFee` in `PROVIDERS`) are added to the cost. History stays plain text, so follow-up turns search again rather than reusing earlier results (unlike the consumer apps; see `~/dev/convovo/convovo-notes/ai-search/capture-log.md`, "API run"). With search on, Grok's thinking text is not returned.

### 🚧 Planned Features
- **API Key Management** - Client-side API tokens with session persistence
- **Conversation Persistence** - Save and load conversations
- **User Authentication** - Account system for saving preferences
- **Conversation History** - Browse past conversations
- **Streaming Responses** - Real-time streaming from supported models
- **Advanced Prompting** - Prompt templates and variables
- **Model Comparison Tools** - Side-by-side evaluation metrics

## Design Principles

- **Simplicity First** - Clean, intuitive interface
- **Real-time Feedback** - Immediate visual responses to user actions
- **Provider Agnostic** - Unified interface across all LLM providers
- **Extensibility** - Easy to add new models and providers
- **Performance** - Parallel API calls for faster responses

## Key Configuration

- **Next.js**: Pages Router with API routes
- **Tailwind**: v4 configuration with custom color scheme
- **Model Colors**: Each model has a unique color for visual distinction
- **Layout**: Fixed header and input area with scrollable message area

## API Structure

### `/api/llm` Endpoint

**Actions:**
- `chat` - Single LLM conversation
- `multi-chat` - Multiple LLMs in parallel
- `synthesize` - Synthesize multiple responses

**Parameters:**
- `messages` - Conversation history
- `model/models` - Model identifier(s)
- `temperature` - Response randomness (0-1)
- `systemPrompt` - System instructions
- `synthesisModel` - Model for synthesis

## Development Guidelines

1. **Adding New Models**: Update `handWrittenModels` in `lib/llm.js`, then re-run `node scripts/sync-panel.mjs`. Panel models come from modelun; add them there, not here
   - Supersede with `legacy: true`; delete only when the provider no longer serves the id or silently answers with another model. Audit by sending a short request to each id and comparing the response's `model` field (DeepInfra serves `ibm-granite/granite-4.2-30b` as `granite-4.2-8b`, 2026-10-29)
   - Picker default and lab groups: `DEFAULT_MODELS` in `pages/index.js`, `LAB_GROUPS` in `lib/llm.js`
2. **Provider Integration**: Add provider-specific function in `lib/llm.js`
3. **UI Updates**: Modify `pages/index.js` for interface changes
4. **Error Handling**: Always include try-catch blocks for API calls
5. **Testing**: Test with missing API keys and network failures

## Important Notes

- API keys are sensitive - never commit them to version control
- Rate limits vary by provider - implement appropriate error handling
- Some models may have different response formats - normalize in provider functions
- Costs can accumulate quickly with multiple models - monitor usage via cost tracking
- Different models require different parameter names and values (max_tokens vs max_completion_tokens, gpt-5 models don't support temperature)
- Cost estimates use rough token approximation (1 token ≈ 4 characters)