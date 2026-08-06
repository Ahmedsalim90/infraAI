import { useMemo, useState } from 'react';
import { useCollabSocket } from './useCollabSocket';
import './App.css';

function App() {
  const roomId = 'infra-ai-room';
  const { state, emitDesignUpdate, isConnected, isRemoteTyping, setTyping } = useCollabSocket(roomId);
  const [draft, setDraft] = useState('');

  const nodeText = useMemo(() => state.nodes['node-1']?.content ?? '', [state.nodes]);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setDraft(nextValue);
    emitDesignUpdate({ nodeId: 'node-1', actor: 'human-user', value: nextValue, source: 'human', revision: (state.nodes['node-1']?.revision ?? 0) + 1 });
    setTyping(true);
  };

  const handleAiDemo = () => {
    emitDesignUpdate({ nodeId: 'node-1', actor: 'ai-agent', value: `${draft || 'AI draft'} [AI generated]`, source: 'ai', revision: (state.nodes['node-1']?.revision ?? 0) + 1 });
  };

  return (
    <main className="app-shell">
      <section className="panel">
        <h1>Live collaboration</h1>
        <p>{isConnected ? 'Socket connected' : 'Connecting to collaboration server...'}</p>
        <p className="status-bar">{isRemoteTyping ? 'Another tab is typing…' : 'Human edits and AI edits both flow through the shared design-update event.'}</p>
        <textarea value={draft} onChange={handleChange} onBlur={() => setTyping(false)} onFocus={() => setTyping(true)} placeholder="Start typing here..." rows={12} />
        <div className="actions">
          <button type="button" onClick={handleAiDemo}>Send AI update</button>
        </div>
        <div className="preview">
          <h2>Shared node state</h2>
          <pre>{nodeText || 'No content yet'}</pre>
        </div>
      </section>
    </main>
  );
}

export default App;
