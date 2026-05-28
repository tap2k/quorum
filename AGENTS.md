# Quorum — Agent / Codebase Guide

This file provides context for AI coding assistants (Claude Code, Cursor, Codex, etc.) and humans working in this repo. `CLAUDE.md` is a pointer to this file.

## Project Overview

**Quorum** is a multi-LLM conversation platform that enables users to:
- Conduct simultaneous conversations with multiple Large Language Models
- Compare responses from different AI providers side-by-side
- Customize system prompts for each conversation
- Synthesize insights from multiple AI responses
- 80+ models across 10+ providers: Anthropic, OpenAI, Google, xAI, Meta, DeepSeek, Qwen, Moonshot, Zhipu AI, plus open-source (Gemma, Mistral, GPT-OSS, etc.) via DeepInfra

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
- `DEEPINFRA_API_KEY` - DeepInfra gateway for Meta, DeepSeek, Qwen, Moonshot, Zhipu AI, Gemma, Mistral, GPT-OSS, and other open-source models
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

The full registry — including pricing, context windows, provider routing, and per-model quirks — lives in [`lib/llm.js`](lib/llm.js) under `modelConfigs`. Highlights by provider:

- **Anthropic** — Claude Opus 4.8, Sonnet 4.6, Haiku 4.5 (+ older 4.x and 3.x)
- **OpenAI** — GPT-5.5, GPT-5.4 (+ Mini/Nano), o3, o4-mini, GPT-4o
- **Google** — Gemini 3.1 Pro, 3.5 Flash, 3 Flash, 2.5 family
- **xAI** — Grok 4.3, Grok 4.20 Beta, Grok 4, Grok 4-1 Fast (reasoning + non-reasoning)
- **Meta** (via DeepInfra) — Llama 4 Maverick, Llama 4 Scout, Llama 3.3 70B
- **DeepSeek** (via DeepInfra) — V4 Pro/Flash, V3.2 Exp, V3.1 Terminus, R1
- **Qwen** (via DeepInfra) — Qwen3.5 / Qwen3.6 family (range of sizes)
- **Moonshot** (via DeepInfra) — Kimi K2.6, K2.5, K2 Instruct
- **Zhipu AI** (via DeepInfra) — GLM-5.1, GLM-4.7 family, GLM-4.6
- **Other open-source** (via DeepInfra) — Gemma 3/4, Mistral, Step, Nemotron, MiniMax, GPT-OSS

Reasoning models (o-series, GPT-5+, Opus 4.8/4.7, R1, Qwen Thinking, etc.) ignore `temperature` and use `reasoning_effort` instead — `lib/llm.js` handles this per-model.

## Feature Status

### ✅ Completed Features
- **Multi-LLM Conversations** - Query multiple models simultaneously
- **Model Selection UI** - Interactive model picker with visual indicators
- **System Prompt Configuration** - Customizable system prompts for all models
- **Temperature Control** - Adjustable temperature parameter (0-1)
- **Response Synthesis** - AI-powered synthesis of multiple responses
- **Error Handling** - Graceful handling of API failures
- **Responsive Design** - Mobile-friendly interface
- **Cost Tracking** - Real-time cost estimation per model and total conversation
- **Latest Models** - Support for Claude 4, GPT-5, Gemini 2.5, Llama 4, etc.
- **Smart Parameter Handling** - Automatic handling of model-specific requirements

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

1. **Adding New Models**: Update `modelConfigs` in `lib/llm.js`
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