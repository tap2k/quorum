// API endpoint for LLM calls
import { callLLM, callMultipleLLMs, synthesizeResponses } from '@/lib/llm';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, ...params } = req.body;

  try {
    switch (action) {
      case 'chat':
        // Single LLM call
        const response = await callLLM(params);
        return res.status(200).json({ response });

      case 'multi-chat':
        // Multiple LLMs in parallel
        const responses = await callMultipleLLMs(params);
        return res.status(200).json({ responses });

      case 'synthesize':
        // Synthesize multiple responses
        const synthesis = await synthesizeResponses(params);
        return res.status(200).json({ synthesis });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('LLM API error:', error);
    return res.status(500).json({ error: error.message });
  }
}