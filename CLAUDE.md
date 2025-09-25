# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Quorum** is a multi-LLM conversation platform that enables users to:
- Conduct simultaneous conversations with multiple Large Language Models
- Compare responses from different AI providers side-by-side
- Customize system prompts for each conversation
- Synthesize insights from multiple AI responses
- Support for models from Anthropic, OpenAI, Google, xAI (Grok), and Meta

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
- `DEEPINFRA_API_KEY` - DeepInfra for Meta Llama models
- `NEXT_PUBLIC_SITE_URL` - Site URL configuration

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

**Anthropic**
- Claude Sonnet 4 (claude-sonnet-4-0)
- Claude Opus 4 (claude-opus-4-1)

**OpenAI**
- GPT-5 (gpt-5) - Note: No custom temperature support
- GPT-5 Mini (gpt-5-mini) - Note: No custom temperature support
- GPT-5 Nano (gpt-5-nano) - Note: No custom temperature support

**Google**
- Gemini 2.5 Pro (gemini-2.5-pro)
- Gemini 2.5 Flash (gemini-2.5-flash)
- Gemini 2.5 Flash Lite (gemini-2.5-flash-lite)

**xAI**
- Grok 4 (grok-4)

**Meta (via DeepInfra)**
- Llama 4 Maverick (meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8)
- Llama 4 Scout (meta-llama/Llama-4-Scout-17B-16E-Instruct)

**DeepSeek (via DeepInfra)**
- DeepSeek V3 (deepseek-ai/DeepSeek-V3)
- DeepSeek R1 (deepseek-ai/DeepSeek-R1-Turbo)

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