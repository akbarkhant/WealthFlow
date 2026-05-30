import { useState, useRef, useEffect } from 'react';
import api from '../api/client';
import '../styles/pages/AI_Page.css';

const TABS = [
    { id: 'chat', label: 'Assistant', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'analyze', label: 'Analyze', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'suggest', label: 'Plan', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
];

const INITIAL_MESSAGE = { role: 'ai', text: 'Hello. I am your Wealth Flow financial advisor. Ask me anything about budgeting, saving, or investments.' };

const ICONS = {
    newChat: 'M12 4v16m8-8H4',
    save: 'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4',
    history: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    send: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
    download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
    close: 'M6 18L18 6M6 6l12 12',
};

function Icon({ path, size = 20, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
            strokeLinejoin="round" className={className}>
            <path d={path} />
        </svg>
    );
}

function TypingDots() {
    return (
        <span className="typing-dots">
            <span /><span /><span />
        </span>
    );
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function generateTitle(messages) {
    const firstUser = messages.find(m => m.role === 'user');
    if (!firstUser) return 'New conversation';
    const text = firstUser.text.trim();
    return text.length > 40 ? text.slice(0, 40) + '...' : text;
}

const STORAGE_KEY = 'wf_ai_chats';

function loadChats() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
}

function saveChats(chats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

export default function AI() {
    const [tab, setTab] = useState('chat');
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [input, setInput] = useState('');
    const [expenses, setExpenses] = useState('{\n  "food": 300,\n  "rent": 800,\n  "transport": 100,\n  "entertainment": 150\n}');
    const [analysis, setAnalysis] = useState('');
    const [income, setIncome] = useState('');
    const [suggestExpenses, setSuggestExpenses] = useState('{\n  "food": 300,\n  "rent": 800,\n  "transport": 100\n}');
    const [suggestions, setSuggestions] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [savedChats, setSavedChats] = useState(loadChats);
    const [showHistory, setShowHistory] = useState(false);
    const [saveToast, setSaveToast] = useState(false);
    const [activeChatId, setActiveChatId] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleNewChat = () => {
        setMessages([INITIAL_MESSAGE]);
        setInput('');
        setActiveChatId(null);
        setShowHistory(false);
    };

    const handleSaveChat = () => {
        const real = messages.filter(m => m.text !== '__typing__');
        if (real.filter(m => m.role === 'user').length === 0) return;
        const chats = loadChats();
        if (activeChatId) {
            const updated = chats.map(c =>
                c.id === activeChatId
                    ? { ...c, messages: real, title: generateTitle(real), updatedAt: new Date().toISOString() }
                    : c
            );
            saveChats(updated);
            setSavedChats(updated);
        } else {
            const newChat = {
                id: Date.now().toString(),
                title: generateTitle(real),
                messages: real,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const updated = [newChat, ...chats];
            saveChats(updated);
            setSavedChats(updated);
            setActiveChatId(newChat.id);
        }
        setSaveToast(true);
        setTimeout(() => setSaveToast(false), 2000);
    };

    const handleLoadChat = (chat) => {
        setMessages(chat.messages);
        setActiveChatId(chat.id);
        setShowHistory(false);
    };

    const handleDeleteChat = (id, e) => {
        e.stopPropagation();
        const updated = savedChats.filter(c => c.id !== id);
        saveChats(updated);
        setSavedChats(updated);
        if (activeChatId === id) { setMessages([INITIAL_MESSAGE]); setActiveChatId(null); }
    };

    const handleExport = () => {
        const real = messages.filter(m => m.text !== '__typing__');
        const text = real.map(m => `${m.role === 'user' ? 'You' : 'WealthFlow AI'}: ${m.text}`).join('\n\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wealthflow-chat-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const text = input.trim();
        setInput('');

        const updated = [...messages, { role: 'user', text }];
        // Create an empty entry for the AI response that we will stream text into
        setMessages([...updated, { role: 'ai', text: '' }]);
        setLoading(true);

        try {
            // 1. Search real transactions related to the query
            let transactions = [];
            try {
                const searchData = await api.get('/search', { params: { q: text } });
                transactions = Array.isArray(searchData)
                    ? searchData
                    : Array.isArray(searchData?.results)
                        ? searchData.results
                        : [];
            } catch (e) {
                // Search failure shouldn't block chat
            }

            // 2. Stream response using native fetch
            const token = localStorage.getItem('token'); // Grab token for auth middleware if needed
            const response = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ message: text, transactions }),
            });

            if (!response.ok) throw new Error('Streaming failed');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiReply = '';

            // Read the stream chunk-by-chunk
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                aiReply += chunk;

                // Continuously update the UI with the text stream
                setMessages([...updated, { role: 'ai', text: aiReply }]);
            }

        } catch (err) {
            setMessages([...updated, { role: 'ai', text: 'Error reaching AI. Is Ollama running?' }]);
        }
        setLoading(false);
    };

    const runAnalyze = async () => {
        setLoading(true);
        setAnalysis('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/ai/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ expenses: JSON.parse(expenses) }),
            });

            if (!response.ok) throw new Error('Analysis streaming failed');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let currentAnalysis = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                currentAnalysis += chunk;
                setAnalysis(currentAnalysis); // Stream output straight to text area
            }

        } catch {
            setAnalysis('Error. Check your JSON format or see if Ollama is running.');
        }
        setLoading(false);
    };

    const runSuggest = async () => {
        setLoading(true);
        setSuggestions('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/ai/suggest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    income: Number(income),
                    expenses: JSON.parse(suggestExpenses),
                }),
            });

            if (!response.ok) throw new Error('Suggestions streaming failed');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let currentSuggestions = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                currentSuggestions += chunk;
                setSuggestions(currentSuggestions); // Stream layout plan step-by-step
            }

        } catch {
            setSuggestions('Error. Check your inputs or see if Ollama is running.');
        }
        setLoading(false);
    };

    const hasRealMessages = messages.filter(m => m.role === 'user').length > 0;

    return (
        <div className={`ai-root ${mounted ? 'mounted' : ''}`}>

            {saveToast && <div className="save-toast">Chat saved</div>}

            <div className="ai-header">
                <div className="ai-eyebrow">Wealth Flow</div>
                <h1 className="ai-title">AI Financial Advisor</h1>
                <p className="ai-subtitle">Powered by Llama 3.2 — running locally on your machine</p>
            </div>

            <div className="ai-layout">
                <nav className="ai-nav">
                    {TABS.map(t => (
                        <button key={t.id} className={`ai-nav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                            <Icon path={t.icon} size={16} className="ai-nav-icon" />
                            {t.label}
                        </button>
                    ))}

                    {tab === 'chat' && (
                        <div className="chat-actions">
                            <button className="chat-action-btn" onClick={handleNewChat}>
                                <Icon path={ICONS.newChat} size={14} /> New chat
                            </button>
                            <button className="chat-action-btn" onClick={handleSaveChat} disabled={!hasRealMessages}>
                                <Icon path={ICONS.save} size={14} /> Save
                            </button>
                            <button className="chat-action-btn" onClick={handleExport} disabled={!hasRealMessages}>
                                <Icon path={ICONS.download} size={14} /> Export
                            </button>
                            <button className={`chat-action-btn ${showHistory ? 'active' : ''}`} onClick={() => setShowHistory(p => !p)}>
                                <Icon path={ICONS.history} size={14} />
                                History
                                {savedChats.length > 0 && <span className="history-badge">{savedChats.length}</span>}
                            </button>
                        </div>
                    )}
                </nav>

                <div className="ai-panel">
                    <div className="ai-panel-header">
                        <Icon path={TABS.find(t => t.id === tab)?.icon} size={18} />
                        <span className="ai-panel-title">
                            {tab === 'chat'
                                ? (activeChatId ? savedChats.find(c => c.id === activeChatId)?.title ?? 'Chat with your advisor' : 'Chat with your advisor')
                                : tab === 'analyze' ? 'Expense Analysis' : 'Savings Planner'}
                        </span>
                        <div className="ai-panel-dot" />
                    </div>

                    {/* History panel */}
                    {tab === 'chat' && showHistory && (
                        <div className="history-panel">
                            <div className="history-header">
                                <span className="history-title">Saved conversations</span>
                                <button className="history-close" onClick={() => setShowHistory(false)}>
                                    <Icon path={ICONS.close} size={14} />
                                </button>
                            </div>
                            {savedChats.length === 0 ? (
                                <div className="history-empty">No saved chats yet</div>
                            ) : (
                                <div className="history-list">
                                    {savedChats.map(chat => (
                                        <div key={chat.id}
                                            className={`history-item ${activeChatId === chat.id ? 'active' : ''}`}
                                            onClick={() => handleLoadChat(chat)}>
                                            <div className="history-item-title">{chat.title}</div>
                                            <div className="history-item-meta">{formatDate(chat.updatedAt)} · {chat.messages.length} messages</div>
                                            <button className="history-delete" onClick={(e) => handleDeleteChat(chat.id, e)}>
                                                <Icon path={ICONS.trash} size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'chat' && !showHistory && (
                        <>
                            <div className="chat-messages">
                                {messages.map((m, i) => (
                                    <div key={i} className={`msg msg-${m.role}`}>
                                        <div className="msg-bubble">
                                            {m.text === '__typing__' ? <TypingDots /> : m.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="chat-input-area">
                                <textarea className="chat-input" value={input} rows={1}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                    placeholder="Ask about budgeting, savings, or investments..." />
                                <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
                                    <Icon path={ICONS.send} size={17} />
                                </button>
                            </div>
                        </>
                    )}

                    {tab === 'analyze' && (
                        <div className="form-section">
                            <div>
                                <label className="form-label">Expenses — JSON format</label>
                                <textarea className="form-textarea" value={expenses} onChange={e => setExpenses(e.target.value)} rows={6} />
                            </div>
                            <button className="run-btn" onClick={runAnalyze} disabled={loading}>
                                {loading ? <><TypingDots /> Analyzing...</> : <><Icon path={TABS[1].icon} size={15} /> Run Analysis</>}
                            </button>
                            {analysis && <div><div className="result-label">Analysis Result</div><div className="result-box">{analysis}</div></div>}
                        </div>
                    )}

                    {tab === 'suggest' && (
                        <div className="form-section">
                            <div>
                                <label className="form-label">Monthly Income</label>
                                <input className="form-input" type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="e.g. 3000" />
                            </div>
                            <div>
                                <label className="form-label">Monthly Expenses — JSON format</label>
                                <textarea className="form-textarea" value={suggestExpenses} onChange={e => setSuggestExpenses(e.target.value)} rows={5} />
                            </div>
                            <button className="run-btn" onClick={runSuggest} disabled={loading || !income}>
                                {loading ? <><TypingDots /> Planning...</> : <><Icon path={TABS[2].icon} size={15} /> Generate Plan</>}
                            </button>
                            {suggestions && <div><div className="result-label">Your Savings Plan</div><div className="result-box">{suggestions}</div></div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}