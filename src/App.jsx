import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactFlow, { MiniMap, Controls, Background } from 'react-flow-renderer';

const tools = {
  web: '🔍 Web Search',
  code: '📊 Code Execution',
  think: '🧠 Reasoning',
  image: '🖼️ Image Generation',
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [view, setView] = useState('linear'); // linear | graph
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const parseTriggers = (text) => {
    const regex = /@(\w+)/g;
    return [...text.matchAll(regex)].map(m => m[1]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { id: uuidv4(), role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    const triggers = parseTriggers(input);
    const newBranches = triggers.map(trigger => ({
      id: uuidv4(),
      parentId: userMsg.id,
      tool: trigger,
      content: `Running @${trigger}...`,
      status: 'running'
    }));

    setMessages(prev => [...prev, ...newBranches.map(b => ({ ...b, role: 'assistant' }))]);

    // Здесь будет реальный вызов API — пока заглушка
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        newBranches.find(b => b.id === m.id)
          ? { ...m, content: `${tools[m.tool] || m.tool} result for "${input}"`, status: 'done' }
          : m
      ));
    }, 1500);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', background: '#111', textAlign: 'center' }}>
        <button onClick={() => setView(view === 'linear' ? 'graph' : 'linear')}>
          {view === 'linear' ? '→ Graph View' : '← Linear View'}
        </button>
      </div>

      {view === 'linear' ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {messages.map(m => (
            <div key={m.id} style={{ 
              margin: '10px 0', 
              padding: '10px', 
              background: m.role === 'user' ? '#333' : '#222',
              borderRadius: '8px',
              borderLeft: m.tool ? '4px solid #0f0' : 'none'
            }}>
              {m.tool && <strong>@{m.tool} → </strong>}
              {m.content}
            </div>
          ))}
        </div>
      ) : (
        <ReactFlow nodes={nodes} edges={edges}>
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      )}

      <div style={{ padding: '10px', background: '#111', display: 'flex' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type @web, @code, @think anywhere..."
          style={{ flex: 1, padding: '10px', background: '#222', border: 'none', color: '#fff' }}
        />
        <button onClick={sendMessage} style={{ marginLeft: '10px' }}>Send</button>
      </div>
    </div>
  );
}
