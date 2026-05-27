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

Quorum currently ships configs for **80+ models across 10+ providers**. A few highlights:

- **Anthropic** — Claude Opus 4.7, Sonnet 4.6, Haiku 4.5
- **OpenAI** — GPT-5.5, GPT-5.4 (+ Mini/Nano), o3, o4-mini
- **Google** — Gemini 3.1 Pro, 3.5 Flash, 2.5 Pro/Flash
- **xAI** — Grok 4.3, Grok 4.20 Beta, Grok 4
- **Meta** — Llama 4 Maverick, Llama 4 Scout *(via DeepInfra)*
- **DeepSeek** — V4 Pro/Flash, V3.2 Exp, R1 *(via DeepInfra)*
- **Qwen** — Qwen3.5 / Qwen3.6 family *(via DeepInfra)*
- **Moonshot** — Kimi K2.6, K2.5 *(via DeepInfra)*
- **Zhipu AI** — GLM-5.1, GLM-4.7 *(via DeepInfra)*
- **Open source** — Gemma, Mistral, GPT-OSS *(via DeepInfra)*

The full registry — including pricing, context windows, and provider routing — lives in [`lib/llm.js`](lib/llm.js). To add or update a model, edit `modelConfigs` there.

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
│   └── llm.js                # LLM service and model registry
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

Edit `lib/llm.js` and add to `modelConfigs`:

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

Reasoning models (OpenAI o-series, GPT-5+, Claude Opus 4.7, and others) don't accept a custom temperature and instead use a `reasoning_effort` parameter. `lib/llm.js` handles these per-model differences automatically — you can leave the temperature slider in the UI and the right thing will happen.

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
- Provider APIs: Anthropic, OpenAI, Google, xAI, DeepInfra

## Support

For issues, questions, or suggestions, please open an issue on GitHub.