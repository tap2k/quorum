import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { modelConfigs, getAvailableModels, calculateCost, calculateCostFromUsage } from '@/lib/llm';
import {
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  TrashIcon,
  KeyIcon,
  StopIcon,
  PlayIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

function buildHistoryForModel(turns, side, introMessage) {
  const messages = [];
  if (side === 'A') {
    messages.push({ role: 'user', content: introMessage });
  }
  for (const turn of turns) {
    if (turn.type === 'interjection') {
      messages.push({ role: 'user', content: turn.content });
    } else if (side === 'A') {
      messages.push({
        role: turn.side === 'A' ? 'assistant' : 'user',
        content: turn.content,
      });
    } else {
      messages.push({
        role: turn.side === 'A' ? 'user' : 'assistant',
        content: turn.content,
      });
    }
  }
  return messages;
}

function calculateDialogueCost(turns) {
  let total = 0;
  for (const turn of turns) {
    if (turn.type === 'interjection') continue;
    if (turn.usage) {
      const cost = calculateCostFromUsage(turn.model, turn.usage);
      total += cost?.total || 0;
    } else if (turn.content) {
      const cost = calculateCost(turn.model, '', turn.content);
      total += cost?.total || 0;
    }
  }
  if (total === 0) return '$0.00';
  return total < 0.01 ? '<$0.01' : `$${total.toFixed(2)}`;
}

export default function Dialogue() {
  const [modelA, setModelA] = useState('claude-sonnet-4.6');
  const [modelB, setModelB] = useState('gpt-5-mini');
  const [systemPromptA, setSystemPromptA] = useState('');
  const [systemPromptB, setSystemPromptB] = useState('');
  const [introMessage, setIntroMessage] = useState('');
  const [numRounds, setNumRounds] = useState(5);
  const [temperature, setTemperature] = useState(0.7);
  const [dialogueTurns, setDialogueTurns] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentThinker, setCurrentThinker] = useState(null);
  const [interjection, setInterjection] = useState('');
  const [synthesisModel, setSynthesisModel] = useState('gemini-3-flash');
  const [synthesisContent, setSynthesisContent] = useState(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [showLegacyModels, setShowLegacyModels] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    ANTHROPIC_API_KEY: '',
    OPENAI_API_KEY: '',
    GOOGLE_API_KEY: '',
    XAI_API_KEY: '',
    DEEPINFRA_API_KEY: ''
  });

  const shouldStopRef = useRef(false);
  const turnsEndRef = useRef(null);

  const availableModels = getAvailableModels({ includeLegacy: showLegacyModels });
  const allModels = Object.entries(availableModels).flatMap(([, models]) => models);

  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogueTurns, currentThinker]);

  useEffect(() => {
    const savedKeys = localStorage.getItem('quorum_api_keys');
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (e) {
        console.error('Failed to load API keys:', e);
      }
    }
  }, []);

  const updateApiKey = (key, value) => {
    const newKeys = { ...apiKeys, [key]: value };
    setApiKeys(newKeys);
    localStorage.setItem('quorum_api_keys', JSON.stringify(newKeys));
  };

  const runDialogue = async (existingTurns = null) => {
    setIsRunning(true);
    shouldStopRef.current = false;
    setCurrentThinker(null);

    let turns;
    if (existingTurns) {
      turns = [...existingTurns];
    } else {
      turns = [];
      setDialogueTurns([]);
      setSynthesisContent(null);
    }

    for (let round = 0; round < numRounds; round++) {
      if (shouldStopRef.current) break;

      // Model A's turn
      setCurrentThinker(modelA);
      try {
        const historyForA = buildHistoryForModel(turns, 'A', introMessage);
        const responseA = await fetch('/api/llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'chat',
            messages: historyForA,
            model: modelA,
            temperature,
            systemPrompt: systemPromptA,
            apiKeys,
          })
        });

        if (!responseA.ok) {
          const err = await responseA.json().catch(() => ({ error: 'Request failed' }));
          turns.push({ model: modelA, side: 'A', content: null, error: err.error || 'Request failed', success: false });
          setDialogueTurns([...turns]);
          break;
        }

        const dataA = await responseA.json();
        turns.push({
          model: modelA,
          side: 'A',
          content: dataA.response,
          duration: dataA.duration,
          usage: dataA.usage,
          success: true,
        });
        setDialogueTurns([...turns]);
      } catch (error) {
        turns.push({ model: modelA, side: 'A', content: null, error: error.message, success: false });
        setDialogueTurns([...turns]);
        break;
      }

      if (shouldStopRef.current) break;

      // Model B's turn
      setCurrentThinker(modelB);
      try {
        const historyForB = buildHistoryForModel(turns, 'B', introMessage);
        const responseB = await fetch('/api/llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'chat',
            messages: historyForB,
            model: modelB,
            temperature,
            systemPrompt: systemPromptB,
            apiKeys,
          })
        });

        if (!responseB.ok) {
          const err = await responseB.json().catch(() => ({ error: 'Request failed' }));
          turns.push({ model: modelB, side: 'B', content: null, error: err.error || 'Request failed', success: false });
          setDialogueTurns([...turns]);
          break;
        }

        const dataB = await responseB.json();
        turns.push({
          model: modelB,
          side: 'B',
          content: dataB.response,
          duration: dataB.duration,
          usage: dataB.usage,
          success: true,
        });
        setDialogueTurns([...turns]);
      } catch (error) {
        turns.push({ model: modelB, side: 'B', content: null, error: error.message, success: false });
        setDialogueTurns([...turns]);
        break;
      }
    }

    setCurrentThinker(null);
    setIsRunning(false);
  };

  const stopDialogue = () => {
    shouldStopRef.current = true;
  };

  const continueDialogue = () => {
    let turns = [...dialogueTurns];
    if (interjection.trim()) {
      turns.push({ type: 'interjection', content: interjection.trim() });
      setDialogueTurns(turns);
      setInterjection('');
    }
    setSynthesisContent(null);
    runDialogue(turns);
  };

  const handleSynthesize = async () => {
    if (dialogueTurns.filter(t => t.success).length < 2) return;

    setIsSynthesizing(true);
    try {
      const nameA = configA?.displayName || modelA;
      const nameB = configB?.displayName || modelB;

      // Format as turn-by-turn dialogue so synthesis model can follow the flow
      const dialogueText = dialogueTurns
        .filter(t => t.success || t.type === 'interjection')
        .map(t => {
          if (t.type === 'interjection') return `**[User Interjection]:** ${t.content}`;
          return `**${t.side === 'A' ? nameA : nameB}:** ${t.content}`;
        })
        .join('\n\n---\n\n');

      const responses = [
        { model: modelA, response: dialogueText, success: true },
      ];

      const synthesisPrompt = `You are analyzing a dialogue between two AI models. Each model had its own perspective and system prompt.

Analyze the dialogue and provide:

1. **Summary** — What was the dialogue about? What was the central question or topic?

2. **${nameA}'s Position** — What were their main arguments, claims, or contributions? What was their overall stance?

3. **${nameB}'s Position** — Same as above.

4. **Points of Agreement** — Where did the models converge or reinforce each other?

5. **Points of Disagreement** — Where did they diverge, contradict, or challenge each other?

6. **Assessment** — Which model made stronger or more well-supported arguments, and why? Were there any logical gaps, unsupported claims, or particularly compelling points from either side? Was there a clear "winner," or did each model contribute different strengths?

7. **Key Takeaway** — What is the most useful or important insight a reader should walk away with from this exchange?

Be specific — reference actual claims made in the dialogue rather than speaking in generalities.`;

      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'synthesize',
          responses,
          synthesisModel,
          synthesisPrompt,
          apiKeys,
        })
      });

      if (!response.ok) throw new Error('Synthesis request failed');

      const data = await response.json();
      if (data.synthesis) {
        setSynthesisContent(data.synthesis);
      }
    } catch (error) {
      console.error('Synthesis error:', error);
      alert('Failed to synthesize dialogue');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const clearDialogue = () => {
    if (dialogueTurns.length === 0 || confirm('Clear dialogue?')) {
      setDialogueTurns([]);
      setSynthesisContent(null);
    }
  };

  const exportDialogue = () => {
    const data = {
      modelA, modelB,
      systemPromptA, systemPromptB,
      introMessage, numRounds, temperature,
      dialogueTurns,
      synthesisContent,
      synthesisModel,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quorum-dialogue-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importDialogue = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.modelA) setModelA(data.modelA);
        if (data.modelB) setModelB(data.modelB);
        if (data.systemPromptA !== undefined) setSystemPromptA(data.systemPromptA);
        if (data.systemPromptB !== undefined) setSystemPromptB(data.systemPromptB);
        if (data.introMessage !== undefined) setIntroMessage(data.introMessage);
        if (data.numRounds) setNumRounds(data.numRounds);
        if (data.temperature !== undefined) setTemperature(data.temperature);
        if (data.dialogueTurns) setDialogueTurns(data.dialogueTurns);
        if (data.synthesisContent) setSynthesisContent(data.synthesisContent);
        if (data.synthesisModel) setSynthesisModel(data.synthesisModel);
        alert('Dialogue imported successfully!');
      } catch {
        alert('Failed to import dialogue. Invalid file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const configA = modelConfigs[modelA];
  const configB = modelConfigs[modelB];
  const canStart = introMessage.trim() && modelA && modelB && !isRunning;
  const hasSuccessfulTurns = dialogueTurns.filter(t => t.success).length >= 2;

  return (
    <>
      <Head>
        <title>Quorum - Dialogue Mode</title>
        <meta name="description" content="Two LLMs converse with each other" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Quorum</h1>
              <div className="flex items-center gap-2">
                {dialogueTurns.length > 0 && (
                  <span className="hidden sm:inline text-sm text-gray-600">
                    Est. Cost: {calculateDialogueCost(dialogueTurns)}
                  </span>
                )}
                <label className="cursor-pointer p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors" title="Import dialogue">
                  <input type="file" accept=".json" onChange={importDialogue} className="hidden" />
                  <CloudArrowUpIcon className="w-5 h-5" />
                </label>
                <button
                  onClick={exportDialogue}
                  disabled={dialogueTurns.length === 0}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Export dialogue"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className={`p-1.5 rounded-md transition-colors ${showApiKeys ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                  title="API Keys"
                >
                  <KeyIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={clearDialogue}
                  disabled={dialogueTurns.length === 0 && !synthesisContent}
                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Clear dialogue"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* API Keys */}
        {showApiKeys && (
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-4 py-4">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-gray-700">API Keys (stored locally in browser):</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    ['ANTHROPIC_API_KEY', 'Anthropic (Claude)'],
                    ['OPENAI_API_KEY', 'OpenAI (GPT)'],
                    ['GOOGLE_API_KEY', 'Google (Gemini)'],
                    ['XAI_API_KEY', 'xAI (Grok)'],
                    ['DEEPINFRA_API_KEY', 'DeepInfra'],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="text-xs text-gray-600">{label}</label>
                      <input
                        type="password"
                        value={apiKeys[key]}
                        onChange={(e) => updateApiKey(key, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Panel */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-6">
            {/* Two model columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Model A */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: configA?.color || '#666' }} />
                  <label className="text-sm font-medium text-gray-700">Model A</label>
                </div>
                <select
                  value={modelA}
                  onChange={(e) => setModelA(e.target.value)}
                  disabled={isRunning}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  {allModels.map(model => (
                    <option key={model.id} value={model.id}>{model.displayName}</option>
                  ))}
                </select>
                <textarea
                  value={systemPromptA}
                  onChange={(e) => setSystemPromptA(e.target.value)}
                  disabled={isRunning}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  rows="2"
                  placeholder="System prompt for Model A..."
                />
              </div>

              {/* Model B */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: configB?.color || '#666' }} />
                  <label className="text-sm font-medium text-gray-700">Model B</label>
                </div>
                <select
                  value={modelB}
                  onChange={(e) => setModelB(e.target.value)}
                  disabled={isRunning}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  {allModels.map(model => (
                    <option key={model.id} value={model.id}>{model.displayName}</option>
                  ))}
                </select>
                <textarea
                  value={systemPromptB}
                  onChange={(e) => setSystemPromptB(e.target.value)}
                  disabled={isRunning}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  rows="2"
                  placeholder="System prompt for Model B..."
                />
              </div>
            </div>

            {/* Intro message */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">Opening Message</label>
              <textarea
                value={introMessage}
                onChange={(e) => setIntroMessage(e.target.value)}
                disabled={isRunning}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                rows="2"
                placeholder="The message that kicks off the dialogue (sent to Model A first)..."
              />
            </div>

            {/* Settings row */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Rounds:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={numRounds}
                  onChange={(e) => setNumRounds(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  disabled={isRunning}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Temperature:</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  disabled={isRunning}
                  className="w-32"
                />
                <span className="text-sm text-gray-700 w-8">{temperature}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Legacy Models:</label>
                <input
                  type="checkbox"
                  checked={showLegacyModels}
                  onChange={(e) => setShowLegacyModels(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>

              {/* Start / Stop */}
              <div className="ml-auto">
                {isRunning ? (
                  <button
                    onClick={stopDialogue}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    <StopIcon className="w-4 h-4" />
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={() => runDialogue()}
                    disabled={!canStart}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlayIcon className="w-4 h-4" />
                    Start Dialogue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dialogue Turns */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
            {/* Intro message display */}
            {dialogueTurns.length > 0 && introMessage && (
              <div className="flex justify-center mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 max-w-2xl">
                  <p className="text-xs font-medium text-blue-600 mb-1">Opening Message</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{introMessage}</p>
                </div>
              </div>
            )}

            {/* Turns */}
            {dialogueTurns.map((turn, index) => {
              if (turn.type === 'interjection') {
                return (
                  <div key={index} className="flex justify-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 max-w-2xl">
                      <p className="text-xs font-medium text-blue-600 mb-1">Interjection</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{turn.content}</p>
                    </div>
                  </div>
                );
              }

              const config = modelConfigs[turn.model];
              const isLeft = turn.side === 'A';

              return (
                <div
                  key={index}
                  className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 border border-gray-200 bg-gray-50`}
                    style={{ borderLeftColor: isLeft ? config?.color : undefined, borderLeftWidth: isLeft ? '3px' : undefined, borderRightColor: !isLeft ? config?.color : undefined, borderRightWidth: !isLeft ? '3px' : undefined }}
                  >
                    <div className={`flex items-center justify-between mb-2 gap-4 ${!isLeft ? 'flex-row-reverse' : ''}`}>
                      <span className="font-semibold text-sm" style={{ color: config?.color }}>
                        {config?.displayName || turn.model}
                      </span>
                      {turn.success && (
                        <span className="text-xs text-gray-500 flex items-center gap-2">
                          {(() => {
                            const cost = turn.usage
                              ? calculateCostFromUsage(turn.model, turn.usage)
                              : calculateCost(turn.model, '', turn.content);
                            return <span>{turn.usage ? '' : '~'}{cost?.formatted || ''}</span>;
                          })()}
                          {turn.duration && (
                            <span className="text-gray-400">
                              {(turn.duration / 1000).toFixed(1)}s
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    {turn.success ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{turn.content}</p>
                    ) : (
                      <p className="text-sm text-red-600 italic">{turn.error || 'Unknown error'}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading indicator */}
            {currentThinker && (
              <div className={`flex ${currentThinker === modelA ? 'justify-start' : 'justify-end'}`}>
                <div className="animate-pulse text-sm text-gray-500 px-4 py-2">
                  <span style={{ color: modelConfigs[currentThinker]?.color }}>
                    {modelConfigs[currentThinker]?.displayName}
                  </span>
                  {' '}is thinking...
                </div>
              </div>
            )}

            {/* Synthesis section */}
            {!isRunning && hasSuccessfulTurns && (
              <div className="pt-6 border-t border-gray-200 mt-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <select
                    value={synthesisModel}
                    onChange={(e) => setSynthesisModel(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {Object.entries(modelConfigs).map(([id, config]) => (
                      <option key={id} value={id}>{config.displayName}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleSynthesize}
                    disabled={isSynthesizing}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {synthesisContent ? <ArrowPathIcon className="w-4 h-4" /> : null}
                    {isSynthesizing ? 'Synthesizing...' : synthesisContent ? 'Re-synthesize' : 'Synthesize Dialogue'}
                  </button>
                </div>

                {synthesisContent && (
                  <div className="max-w-4xl mx-auto bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Synthesis ({modelConfigs[synthesisModel]?.displayName})
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{synthesisContent}</p>
                  </div>
                )}
              </div>
            )}

            {/* Continue / Interject */}
            {!isRunning && dialogueTurns.length > 0 && dialogueTurns[dialogueTurns.length - 1].success !== false && (
              <div className="pt-6 border-t border-gray-200 mt-6">
                <div className="flex gap-3">
                  <textarea
                    value={interjection}
                    onChange={(e) => setInterjection(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        continueDialogue();
                      }
                    }}
                    placeholder="Interject something, or just continue..."
                    rows={1}
                    style={{ overflow: 'hidden', resize: 'none' }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={continueDialogue}
                    className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    {interjection.trim() ? 'Interject & Continue' : `Continue (${numRounds} rounds)`}
                  </button>
                </div>
              </div>
            )}

            <div ref={turnsEndRef} />
          </div>
        </main>
      </div>
    </>
  );
}
