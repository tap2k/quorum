# Quorum - Multi-LLM Conversation Platform

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

Quorum enables simultaneous conversations with multiple Large Language Models, allowing you to compare responses, synthesize insights, and leverage the strengths of different AI providers in a single interface.

> **Note:** Quorum is designed to be **self-hosted** — you bring your own API keys and run it locally or on a server only you can reach. The `/api/llm` endpoint has no auth or rate-limiting, so don't expose a Quorum instance to the public internet without adding those yourself.

## Features

- 🤖 **Multi-Model Conversations** - Query multiple LLMs simultaneously
- 🔄 **Response Synthesis** - AI-powered synthesis of multiple model responses
- 💰 **Cost Tracking** - Real-time cost estimation for API usage
- 🎨 **Intuitive UI** - Clean, responsive interface with model-specific color coding
- ⚡ **Latest Models** - Support for cutting-edge models from all major providers
- 🎛️ **Customizable** - Adjustable temperature and system prompts

## Supported Models

Quorum currently ships configs for **~70 current models (140 including legacy) across 25+ labs**, including every runnable model on the [modelun](https://github.com/tap2k/modelun) consensus panel. A few highlights:

- **Anthropic** — Claude Fable 5.1, Mythos 5, Opus 5.5, Sonnet 5.5, Haiku 5.5
- **OpenAI** — GPT-6 Astra, GPT-6.1 Sol, GPT-6 Luna, GPT-5.6 Terra
- **Google** — Gemini 4 Argon, 3.1 Pro, 3.8 Flash, 3.5 Flash Lite
- **xAI** — Grok 4.7
- **Meta** — Muse Wonder, Muse Spark 1.3; Muse Glimmer 30B, Llama 4 Scout *(via DeepInfra)*
- **DeepSeek** — V4 Pro, V4.1 Flash *(via DeepInfra)*
- **Qwen** — Qwen3.6 / Qwen3.5 family *(via DeepInfra)*
- **Moonshot** — Kimi K3 *(via DeepInfra)*
- **Zhipu AI** — GLM-5.3, GLM-5.3 Flash, GLM-4.7 *(via DeepInfra)*
- **Open source** — Gemma 4, Mistral, Nemotron, MiniMax, GPT-OSS *(via DeepInfra)*

Models with a direct provider or DeepInfra route are hand-written in `handWrittenModels` in [`lib/llm.js`](lib/llm.js). The panel models and every model's OpenRouter id are generated into [`lib/panel-models.js`](lib/panel-models.js) by `node scripts/sync-panel.mjs`. A model whose own provider key is not set is called through OpenRouter, and its reply is marked "via OpenRouter".

## Prerequisites

- Node.js 18+
- npm or yarn
- API keys for the providers you want to use

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tap2k/quorum.git
cd quorum
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your API keys to `.env`. You only need keys for the providers whose models you actually plan to use:
```env
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_key
XAI_API_KEY=your_xai_key
DEEPINFRA_API_KEY=your_deepinfra_key   # gateway for Meta, DeepSeek, Qwen, Moonshot, Zhipu, Gemma, Mistral, GPT-OSS
OPENROUTER_API_KEY=your_openrouter_key # panel models, and fallback for any model whose own key is unset

# Optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DEBUG_LLM=1                   # log reasoning/thinking output to server console
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

### Basic Conversation
1. Select models by clicking on them in the model bar
2. Type your message and press Enter
3. View responses from all selected models side-by-side
4. Compare different perspectives and approaches

### Response Synthesis
- Click "Synthesize" after receiving multiple responses
- An AI model will analyze and combine insights from all responses
- Useful for getting a balanced, comprehensive answer

### Customization
- **System Prompt**: Click "System Prompt" to set custom instructions
- **Temperature**: Adjust creativity/randomness (0 = focused, 1 = creative)
- **Reasoning**: Thinking budget for models that support it; the reasoning text is kept and included in exports
- **Panel Mode**: What each model sees of the previous turns. Off (the default), a model sees only its own earlier replies, so the models never read each other. On, every model reads all of the previous turn's replies, labelled by speaker, as if it had said them. Panel mode is the right setting for a round-table; leave it off when you want independent answers to the same conversation.
- **Synthesis Model**: Choose which model synthesizes responses

### Cost Tracking
- Individual response costs shown next to model names
- Total conversation cost displayed in header
- Costs estimated based on token usage

## API Endpoints

### `/api/llm`

Handles all LLM operations:

- `action: 'chat'` - Single model conversation
- `action: 'multi-chat'` - Multiple models in parallel
- `action: 'synthesize'` - Synthesize multiple responses

## Architecture

```
quorum/
├── pages/
│   ├── index.js              # Main UI and conversation logic
│   └── api/
│       └── llm.js            # API endpoint for LLM calls
├── lib/
│   ├── llm.js                # LLM service and hand-written model registry
│   └── panel-models.js       # Generated: modelun panel models and OpenRouter ids
├── scripts/
│   └── sync-panel.mjs        # Regenerates lib/panel-models.js
├── styles/
│   └── globals.css           # Tailwind CSS styles
├── public/                   # Static assets
├── next.config.mjs
├── eslint.config.mjs
├── postcss.config.mjs
├── jsconfig.json
├── package.json
├── AGENTS.md                 # Codebase guide (also linked from CLAUDE.md)
├── LICENSE
└── README.md
```

## Configuration

### Adding New Models

Edit `lib/llm.js` and add to `handWrittenModels`, then re-run `node scripts/sync-panel.mjs` to pick up its OpenRouter id:

```javascript
'model-id': {
  provider: 'provider-name',
  modelName: 'api-model-name',
  displayName: 'Display Name',
  color: '#HexColor',
  cost: { input: 0.00, output: 0.00 }, // per million tokens
}
```

### Temperature Handling

Reasoning models (OpenAI o-series, GPT-5+, Claude Fable 5, Mythos 5, Sonnet 5, Opus 4.8/4.7, and others) don't accept a custom temperature and instead use a `reasoning_effort` parameter. `lib/llm.js` handles these per-model differences automatically — you can leave the temperature slider in the UI and the right thing will happen.

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Troubleshooting

### Model Errors

- **"Field required"**: Check if the model expects different parameter names
- **"Temperature not supported"**: Some models only support default temperature
- **"API key not configured"**: Ensure the corresponding API key is set in `.env`

### Cost Calculations

Costs are estimated using character count (1 token ≈ 4 characters). For exact costs, refer to provider documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- Provider APIs: Anthropic, OpenAI, Google, xAI, Meta, DeepInfra, OpenRouter

## Support

For issues, questions, or suggestions, please open an issue on GitHub.