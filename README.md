# Quorum - Multi-LLM Conversation Platform

![Quorum](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

Quorum enables simultaneous conversations with multiple Large Language Models, allowing you to compare responses, synthesize insights, and leverage the strengths of different AI providers in a single interface.

## Features

- 🤖 **Multi-Model Conversations** - Query multiple LLMs simultaneously
- 🔄 **Response Synthesis** - AI-powered synthesis of multiple model responses
- 💰 **Cost Tracking** - Real-time cost estimation for API usage
- 🎨 **Intuitive UI** - Clean, responsive interface with model-specific color coding
- ⚡ **Latest Models** - Support for cutting-edge models from all major providers
- 🎛️ **Customizable** - Adjustable temperature and system prompts

## Supported Models

### Anthropic
- Claude Sonnet 4
- Claude Opus 4

### OpenAI
- GPT-5
- GPT-5 Mini
- GPT-5 Nano

### Google
- Gemini 2.5 Pro
- Gemini 2.5 Flash
- Gemini 2.5 Flash Lite

### xAI
- Grok 4

### Meta (via DeepInfra)
- Llama 4 Maverick
- Llama 4 Scout

### DeepSeek (via DeepInfra)
- DeepSeek V3
- DeepSeek R1

## Prerequisites

- Node.js 18+
- npm or yarn
- API keys for the providers you want to use

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/quorum.git
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

4. Add your API keys to `.env`:
```env
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_key
XAI_API_KEY=your_xai_key
DEEPINFRA_API_KEY=your_deepinfra_key
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
│   ├── index.js          # Main UI and conversation logic
│   └── api/
│       └── llm.js        # API endpoint for LLM calls
├── lib/
│   └── llm.js           # LLM service and model configurations
├── styles/
│   └── globals.css      # Tailwind CSS styles
└── public/              # Static assets
```

## Configuration

### Adding New Models

Edit `lib/llm.js` and add to `modelConfigs`:

```javascript
'model-id': {
  provider: 'provider-name',
  modelName: 'api-model-name',
  maxTokens: 4000,
  displayName: 'Display Name',
  color: '#HexColor',
  cost: { input: 0.00, output: 0.00 }, // per million tokens
}
```

### Temperature Handling

Some models (like GPT-5 series) don't support custom temperature. The system automatically handles this in `lib/llm.js`.

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