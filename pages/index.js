import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { modelConfigs, getAvailableModels, calculateCost, calculateConversationCost, buildInputText } from '@/lib/llm';
import {
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  TrashIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedModels, setSelectedModels] = useState(['claude-sonnet-4', 'gpt-5-mini', 'gemini-2.5-flash']);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  const [isLoading, setIsLoading] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [synthesisModel, setSynthesisModel] = useState('gemini-2.5-flash');
  const [apiKeys, setApiKeys] = useState({
    ANTHROPIC_API_KEY: '',
    OPENAI_API_KEY: '',
    GOOGLE_API_KEY: '',
    XAI_API_KEY: '',
    DEEPINFRA_API_KEY: ''
  });
  const messagesEndRef = useRef(null);

  // Always show all models - backend will handle authorization
  const availableModels = getAvailableModels();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load API keys from localStorage on mount
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

  // Save API keys to localStorage when they change
  const updateApiKey = (key, value) => {
    const newKeys = { ...apiKeys, [key]: value };
    setApiKeys(newKeys);
    localStorage.setItem('quorum_api_keys', JSON.stringify(newKeys));
  };

  const handleSendMessage = async () => {
    if (!input.trim() || selectedModels.length === 0) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Convert multi-model responses to regular assistant messages
      const messagesForAPI = newMessages
        .filter(m => m.role !== 'synthesis')
        .map(m => {
          if (m.role === 'assistant' && m.responses) {
            // Combine all successful responses into a single content field
            const successfulResponses = m.responses
              .filter(r => r.success)
              .map(r => `[${modelConfigs[r.model].displayName}]:\n${r.response}`)
              .join('\n\n---\n\n');
            return {
              role: 'assistant',
              content: successfulResponses || 'No successful responses'
            };
          }
          return m;
        });

      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'multi-chat',
          messages: messagesForAPI,
          models: selectedModels,
          temperature,
          systemPrompt,
          apiKeys
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.responses) {
        const assistantMessage = {
          role: 'assistant',
          responses: data.responses,
          timestamp: new Date().toISOString()
        };
        setMessages([...newMessages, assistantMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get responses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSynthesize = async (messageIndex) => {
    const message = messages[messageIndex];
    if (!message.responses) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'synthesize',
          responses: message.responses,
          synthesisModel,
          apiKeys
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.synthesis) {
        const synthesisMessage = {
          role: 'synthesis',
          content: data.synthesis,
          model: synthesisModel,
          timestamp: new Date().toISOString()
        };

        // Insert synthesis after the responses
        const newMessages = [...messages];
        newMessages.splice(messageIndex + 1, 0, synthesisMessage);
        setMessages(newMessages);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to synthesize responses');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModel = (modelId) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(m => m !== modelId)
        : [...prev, modelId]
    );
  };

  const clearConversation = () => {
    if (confirm('Clear all messages?')) {
      setMessages([]);
    }
  };

  const deleteFromIndex = (index) => {
    if (confirm('Delete this message and all messages after it?')) {
      setMessages(messages.slice(0, index));
    }
  };

  const exportConversation = () => {
    const data = {
      messages,
      systemPrompt,
      temperature,
      selectedModels,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quorum-conversation-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importConversation = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.messages) setMessages(data.messages);
        if (data.systemPrompt) setSystemPrompt(data.systemPrompt);
        if (data.temperature !== undefined) setTemperature(data.temperature);
        if (data.selectedModels) setSelectedModels(data.selectedModels);
        alert('Conversation imported successfully!');
      } catch (error) {
        alert('Failed to import conversation. Invalid file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  return (
    <>
      <Head>
        <title>Quorum - Multi-LLM Conversations</title>
        <meta name="description" content="Conduct conversations with multiple LLMs simultaneously" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Quorum</h1>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <span className="hidden sm:inline text-sm text-gray-600">
                    Est. Cost: {calculateConversationCost(messages, systemPrompt).formatted}
                  </span>
                )}
                {/* Import button */}
                <label className="cursor-pointer p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors" title="Import conversation">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importConversation}
                    className="hidden"
                  />
                  <CloudArrowUpIcon className="w-5 h-5" />
                </label>
                {/* Export button */}
                <button
                  onClick={exportConversation}
                  disabled={messages.length === 0}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Export conversation"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className={`p-1.5 rounded-md transition-colors ${
                    showApiKeys ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="API Keys"
                >
                  <KeyIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                  className={`p-1.5 rounded-md transition-colors ${
                    showSystemPrompt ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="Settings"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={clearConversation}
                  disabled={messages.length === 0}
                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Clear conversation"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* API Keys Section */}
        {showApiKeys && (
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">API Keys (stored locally in browser):</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-600">Anthropic (Claude)</label>
                    <input
                      type="password"
                      value={apiKeys.ANTHROPIC_API_KEY}
                      onChange={(e) => updateApiKey('ANTHROPIC_API_KEY', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">OpenAI (GPT)</label>
                    <input
                      type="password"
                      value={apiKeys.OPENAI_API_KEY}
                      onChange={(e) => updateApiKey('OPENAI_API_KEY', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Google (Gemini)</label>
                    <input
                      type="password"
                      value={apiKeys.GOOGLE_API_KEY}
                      onChange={(e) => updateApiKey('GOOGLE_API_KEY', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">xAI (Grok)</label>
                    <input
                      type="password"
                      value={apiKeys.XAI_API_KEY}
                      onChange={(e) => updateApiKey('XAI_API_KEY', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">DeepInfra</label>
                    <input
                      type="password"
                      value={apiKeys.DEEPINFRA_API_KEY}
                      onChange={(e) => updateApiKey('DEEPINFRA_API_KEY', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Prompt Section */}
        {showSystemPrompt && (
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">System Prompt:</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter system prompt..."
                />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Temperature:</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-32"
                    />
                    <span className="text-sm text-gray-700 w-8">{temperature}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Synthesis Model:</label>
                    <select
                      value={synthesisModel}
                      onChange={(e) => setSynthesisModel(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      {Object.entries(modelConfigs).map(([id, config]) => (
                        <option key={id} value={id}>{config.displayName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Model Selection */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(availableModels).flatMap(([, models]) =>
                models.map(model => (
                  <button
                    key={model.id}
                    onClick={() => toggleModel(model.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedModels.includes(model.id)
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: selectedModels.includes(model.id) ? model.color : undefined
                    }}
                  >
                    {model.displayName}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 pb-24">
            {messages.map((message, index) => (
              <div key={index}>
                {message.role === 'user' && (
                  <div className="flex justify-end items-start gap-2">
                    <button
                      onClick={() => deleteFromIndex(index)}
                      className="text-xs text-gray-400 hover:text-red-500 mt-3"
                      title="Delete from here"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                    <div className="max-w-2xl bg-blue-500 text-white rounded-lg px-4 py-3">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                )}

                {message.role === 'assistant' && message.responses && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {message.responses.map((response, idx) => {
                        const config = modelConfigs[response.model];
                        // Calculate input text from conversation up to this point
                        const messageIndex = messages.indexOf(message);
                        const priorMessages = messages.slice(0, messageIndex);
                        const inputText = buildInputText(priorMessages, systemPrompt);

                        return (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                            style={{ borderLeftColor: config?.color, borderLeftWidth: '3px' }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-sm" style={{ color: config?.color }}>
                                {config?.displayName}
                              </h3>
                              <div className="flex items-center gap-2">
                                {response.success && config?.cost && (
                                  <span className="text-xs text-gray-500">
                                    ~{calculateCost(response.model, inputText, response.response)?.formatted || ''}
                                  </span>
                                )}
                                {!response.success && (
                                  <span className="flex items-center gap-1 text-xs text-red-600">
                                    <ExclamationCircleIcon className="w-3 h-3" />
                                    Error
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-700">
                              {response.success ? (
                                <p className="whitespace-pre-wrap">{response.response}</p>
                              ) : (
                                <p className="text-red-600 italic">{response.error}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {message.responses.filter(r => r.success).length >= 2 && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleSynthesize(index)}
                          disabled={isLoading}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Synthesize responses"
                        >
                          Synthesize Responses
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {message.role === 'synthesis' && (
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Synthesis ({modelConfigs[message.model]?.displayName})
                        </span>
                        {modelConfigs[message.model]?.cost && (() => {
                          // For synthesis, input includes the multiple model responses
                          const messageIndex = messages.indexOf(message);
                          const priorMessage = messages[messageIndex - 1];
                          let synthesisInput = '';

                          if (priorMessage?.responses) {
                            priorMessage.responses.forEach(r => {
                              if (r.success) {
                                synthesisInput += modelConfigs[r.model]?.displayName + ':\n' + r.response + '\n\n';
                              }
                            });
                          }

                          return (
                            <span className="text-xs text-gray-500">
                              ~{calculateCost(message.model, synthesisInput, message.content)?.formatted || ''}
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-pulse text-gray-500">Thinking...</div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder={selectedModels.length === 0 ? "Select models first..." : "Ask a question..."}
                disabled={isLoading || selectedModels.length === 0}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim() || selectedModels.length === 0}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
            {selectedModels.length === 0 && (
              <p className="text-xs text-orange-600 mt-1">Please select at least one model above</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
