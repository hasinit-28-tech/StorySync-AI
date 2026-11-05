import React from 'react';
import { useMemo, useState } from 'react';
import {
  BookOpen, Sparkles, WandSparkles, Image as ImageIcon, Heart, Clock3,
  Check, X, Pencil, RefreshCw, ArrowRight, Plus, MessageSquareText,
  BarChart3, Settings2, ChevronDown, Stars, Feather, PanelsTopLeft
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const initialPremise = 'Mira finds a tiny glowing map tucked inside an old library book. At midnight, the map begins to redraw itself.';
const starterSuggestions = [
  {
    id: 'starter-1',
    title: 'Follow the moving map',
    text: 'Mira watches a silver line appear on the map and lead toward a locked door beneath the library. The keyhole glows with the same light as the map, but the door only opens when she says the name of a forgotten star.',
    rationale: 'Builds mystery and gives the next scene a visual landmark.'
  },
  {
    id: 'starter-2',
    title: 'A message from the past',
    text: 'A handwritten note slips from the book, signed by a librarian who disappeared a century ago. It warns Mira that the map shows places that have been erased from memory—and one of them is her own home.',
    rationale: 'Connects the discovery to Mira personally and raises the stakes.'
  },
  {
    id: 'starter-3',
    title: 'The map has a guardian',
    text: 'A small fox made of starlight steps out of the page and introduces itself as the map’s guardian. It offers to guide Mira, but first asks her to choose one memory she is willing to risk losing.',
    rationale: 'Introduces a memorable character and a meaningful choice.'
  }
];

function App() {
  const [premise, setPremise] = useState(initialPremise);
  const [character, setCharacter] = useState('Mira');
  const [traits, setTraits] = useState('curious, thoughtful, quietly brave');
  const [genre, setGenre] = useState('Fantasy');
  const [tone, setTone] = useState('Mysterious and hopeful');
  const [suggestions, setSuggestions] = useState(starterSuggestions);
  const [mode, setMode] = useState('sample');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [edits, setEdits] = useState(0);
  const [activeEdit, setActiveEdit] = useState(null);
  const [editText, setEditText] = useState('');
  const [storyDraft, setStoryDraft] = useState('');
  const [tab, setTab] = useState('workspace');
  const [events, setEvents] = useState([]);

  const totalDecisions = accepted.length + rejected.length;
  const acceptanceRate = totalDecisions ? Math.round((accepted.length / totalDecisions) * 100) : 0;

  function logEvent(action, suggestionId, detail = '') {
    setEvents(old => [{
      id: `${Date.now()}-${Math.random()}`,
      action,
      suggestionId,
      detail,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...old].slice(0, 20));
  }

  async function generateSuggestions() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/story/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          premise,
          character_name: character,
          character_traits: traits,
          genre,
          tone
        })
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || 'Could not generate suggestions. Is the backend running?');
      }
      const data = await response.json();
      setSuggestions(data.suggestions);
      setMode(data.mode);
      setAccepted([]);
      setRejected([]);
      setActiveEdit(null);
      logEvent('Generated suggestions', 'all', `Source: ${data.mode}`);
    } catch (e) {
      setError(`${e.message} Showing sample suggestions so you can continue exploring the interface.`);
      setSuggestions(starterSuggestions);
      setMode('sample');
    } finally {
      setLoading(false);
    }
  }

  function acceptSuggestion(s) {
    setAccepted(old => old.includes(s.id) ? old : [...old, s.id]);
    setRejected(old => old.filter(id => id !== s.id));
    setStoryDraft(old => old ? `${old}\n\n${s.text}` : s.text);
    logEvent('Accepted', s.id, s.title);
  }

  function rejectSuggestion(s) {
    setRejected(old => old.includes(s.id) ? old : [...old, s.id]);
    setAccepted(old => old.filter(id => id !== s.id));
    logEvent('Rejected', s.id, s.title);
  }

  function beginEdit(s) {
    setActiveEdit(s.id);
    setEditText(s.text);
  }

  function saveEdit(s) {
    setSuggestions(old => old.map(item => item.id === s.id ? { ...item, text: editText } : item));
    setEdits(old => old + 1);
    setActiveEdit(null);
    logEvent('Edited', s.id, s.title);
  }

  const stats = useMemo(() => [
    { label: 'AI suggestions', value: suggestions.length, icon: Sparkles },
    { label: 'Accepted', value: accepted.length, icon: Check },
    { label: 'Revisions', value: edits, icon: Pencil },
    { label: 'Acceptance rate', value: `${acceptanceRate}%`, icon: BarChart3 }
  ], [suggestions.length, accepted.length, edits, acceptanceRate]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Feather size={21} /></div>
          <div><strong>storysync</strong><span>AI CREATIVE STUDIO</span></div>
        </div>
        <button className={`nav-item ${tab === 'workspace' ? 'active' : ''}`} onClick={() => setTab('workspace')}>
          <PanelsTopLeft size={18} /> Story workspace
        </button>
        <button className={`nav-item ${tab === 'comic' ? 'active' : ''}`} onClick={() => setTab('comic')}>
          <ImageIcon size={18} /> Comic panels <span className="soon">NEXT</span>
        </button>
        <button className={`nav-item ${tab === 'research' ? 'active' : ''}`} onClick={() => setTab('research')}>
          <BarChart3 size={18} /> HAI research
        </button>
        <div className="sidebar-bottom">
          <div className="research-note">
            <div className="note-icon"><Heart size={16} /></div>
            <strong>Human in control</strong>
            <p>AI offers possibilities. You make the story yours.</p>
          </div>
          <div className="profile">
            <div className="avatar">S</div>
            <div><strong>Story creator</strong><span>Local prototype</span></div>
            <Settings2 size={17} className="profile-settings" />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="slash">/</span><strong>{tab === 'workspace' ? 'Untitled story' : tab === 'comic' ? 'Comic panels' : 'HAI research'}</strong></div>
          <div className="top-actions"><span className={`mode-pill ${mode === 'openai' ? 'live' : ''}`}><span className="status-dot" />{mode === 'openai' ? 'AI connected' : mode === 'demo' ? 'Demo AI mode' : 'Preview mode'}</span><button className="share-button" onClick={() => { navigator.clipboard?.writeText(storyDraft || premise); logEvent('Copied story text', 'story'); }}>Copy story <ArrowRight size={15}/></button></div>
        </header>

        {tab === 'workspace' && <div className="page">
          <div className="page-heading">
            <div><div className="eyebrow"><Stars size={14}/> YOUR CREATIVE SPACE</div><h1>Every great story starts<br className="desktop-break"/> with a little <em>what if?</em></h1><p>Build a world, invite AI to collaborate, and keep the final word.</p></div>
            <div className="heading-art"><div className="sun-orb"/><div className="art-book"><BookOpen size={39}/></div><span className="spark spark-a">✦</span><span className="spark spark-b">✧</span></div>
          </div>

          <div className="workspace-grid">
            <section className="left-column">
              <div className="section-title"><span className="step">01</span><div><h2>Set the scene</h2><p>Give your story its starting point.</p></div></div>
              <div className="panel setup-panel">
                <label>STORY PREMISE</label>
                <textarea value={premise} onChange={e => setPremise(e.target.value)} rows={4} placeholder="What happens in your story?"/>
                <div className="field-row">
                  <div className="field"><label>MAIN CHARACTER</label><input value={character} onChange={e => setCharacter(e.target.value)} /></div>
                  <div className="field"><label>GENRE</label><div className="select-wrap"><select value={genre} onChange={e => setGenre(e.target.value)}>{['Fantasy','Mystery','Sci-Fi','Adventure','Comedy','Drama'].map(g => <option key={g}>{g}</option>)}</select><ChevronDown size={15}/></div></div>
                </div>
                <div className="field"><label>CHARACTER TRAITS</label><input value={traits} onChange={e => setTraits(e.target.value)} /></div>
                <div className="field"><label>STORY TONE</label><input value={tone} onChange={e => setTone(e.target.value)} /></div>
                <button className="primary-button" disabled={loading || premise.trim().length < 3} onClick={generateSuggestions}>
                  {loading ? <RefreshCw size={17} className="spin"/> : <WandSparkles size={17}/>}
                  {loading ? 'Dreaming up ideas…' : 'Generate story directions'}
                  {!loading && <ArrowRight size={16}/>}
                </button>
                {error && <div className="inline-warning">{error}</div>}
              </div>

              <div className="section-title suggestions-title"><span className="step">02</span><div><h2>Choose a direction</h2><p>Three possibilities. Your story, your choice.</p></div></div>
              <div className="suggestion-list">
                {suggestions.map((s, i) => {
                  const isAccepted = accepted.includes(s.id);
                  const isRejected = rejected.includes(s.id);
                  return <article className={`suggestion-card ${isAccepted ? 'chosen' : ''} ${isRejected ? 'dismissed' : ''}`} key={s.id}>
                    <div className="suggestion-top"><div className={`idea-number idea-${i+1}`}>0{i+1}</div><div className="suggestion-title"><h3>{s.title}</h3><span><Sparkles size={12}/> AI SUGGESTION</span></div>{isAccepted && <span className="accepted-tag"><Check size={12}/> Added</span>}{isRejected && <span className="rejected-tag">Passed</span>}</div>
                    {activeEdit === s.id ? <textarea className="edit-area" value={editText} onChange={e => setEditText(e.target.value)} rows={4}/> : <p className="suggestion-text">{s.text}</p>}
                    <div className="rationale"><MessageSquareText size={14}/><span>{s.rationale}</span></div>
                    <div className="suggestion-actions">
                      {activeEdit === s.id ? <><button className="action-button accept" onClick={() => saveEdit(s)}><Check size={14}/> Save edit</button><button className="action-button" onClick={() => setActiveEdit(null)}>Cancel</button></> : <>
                        <button className={`action-button accept ${isAccepted ? 'selected' : ''}`} onClick={() => acceptSuggestion(s)}><Check size={14}/>{isAccepted ? 'Accepted' : 'Accept'}</button>
                        <button className="action-button" onClick={() => beginEdit(s)}><Pencil size={14}/> Edit</button>
                        <button className={`action-button reject ${isRejected ? 'selected' : ''}`} onClick={() => rejectSuggestion(s)}><X size={14}/>{isRejected ? 'Rejected' : 'Reject'}</button>
                      </>}
                    </div>
                  </article>;
                })}
              </div>
            </section>

            <aside className="right-column">
              <div className="section-title"><span className="step">03</span><div><h2>Your story</h2><p>What you've chosen so far.</p></div></div>
              <div className="story-preview panel">
                <div className="preview-top"><span><BookOpen size={15}/> STORY DRAFT</span><span className="draft-status">IN PROGRESS</span></div>
                <h3>{character || 'Your character'} & the unknown</h3>
                <p>{storyDraft || 'Your accepted story directions will appear here. Start by choosing an idea that feels right, or edit one to make it your own.'}</p>
                <div className="preview-footer"><span><Clock3 size={14}/> Autosave is local to this session</span><button onClick={() => setStoryDraft('')}>Clear draft</button></div>
              </div>

              <div className="comic-placeholder panel">
                <div className="comic-placeholder-top"><div><span className="mini-eyebrow">COMING NEXT</span><h3>Bring it to life</h3></div><div className="comic-icon"><ImageIcon size={23}/></div></div>
                <p>Turn your favorite scene into a comic panel with character art, captions, and dialogue.</p>
                <button className="outline-button" onClick={() => setTab('comic')}>Explore comic studio <ArrowRight size={15}/></button>
              </div>

              <div className="metrics-panel panel">
                <div className="metrics-heading"><div><span className="mini-eyebrow">COLLABORATION PULSE</span><h3>Your creative process</h3></div><BarChart3 size={19}/></div>
                <div className="metrics-grid">{stats.map(({label, value, icon: Icon}) => <div className="metric" key={label}><div className="metric-icon"><Icon size={15}/></div><strong>{value}</strong><span>{label}</span></div>)}</div>
                <p className="metrics-footnote">Interaction metrics are descriptive—not a score of your creativity.</p>
              </div>
            </aside>
          </div>
          <footer className="page-footer"><span>STORYSYNC AI <span className="footer-dot">•</span> HUMAN-AI CO-CREATION</span><span>Prototype v0.1 · Your imagination leads.</span></footer>
        </div>}

        {tab === 'comic' && <div className="page alternate-page">
          <div className="eyebrow"><ImageIcon size={14}/> COMIC STUDIO</div><h1>Turn scenes into <em>panels.</em></h1><p className="alternate-lede">The comic generation module is the next development milestone. For now, your approved story draft is ready to use as the source material.</p>
          <div className="comic-board">
            {[1,2,3].map((n) => <div className="comic-panel" key={n}><span>0{n}</span><div className="panel-illustration"><ImageIcon size={30}/></div><strong>{n === 1 ? 'Establish the scene' : n === 2 ? 'Show the discovery' : 'Reveal the choice'}</strong><p>{n === 1 ? 'Set the location and mood.' : n === 2 ? 'Show the key story moment.' : 'End with a visual hook.'}</p><small>ILLUSTRATION PLACEHOLDER</small></div>)}
          </div>
          <div className="panel setup-panel"><label>APPROVED STORY DRAFT</label><textarea rows={5} value={storyDraft} onChange={e => setStoryDraft(e.target.value)} placeholder="Accept or write a story scene in the workspace first, then it will be available here."/><p className="help-text">Next step: connect an image-generation provider and add a scene-to-panel pipeline.</p><button className="primary-button" onClick={() => setTab('workspace')}>Back to story workspace <ArrowRight size={16}/></button></div>
        </div>}

        {tab === 'research' && <div className="page alternate-page">
          <div className="eyebrow"><BarChart3 size={14}/> HUMAN-AI INTERACTION STUDY</div><h1>Understand the <em>collaboration.</em></h1><p className="alternate-lede">This early dashboard summarizes interactions in the current browser session. It is not a completed user study or validated measure.</p>
          <div className="research-stats">{stats.map(({label, value, icon: Icon}) => <div className="panel research-stat" key={label}><Icon size={20}/><strong>{value}</strong><span>{label}</span></div>)}</div>
          <div className="panel event-panel"><div className="metrics-heading"><div><span className="mini-eyebrow">SESSION EVENT LOG</span><h3>Recent creative decisions</h3></div><span className="event-count">{events.length} events</span></div>
            {events.length === 0 ? <div className="empty-events"><MessageSquareText size={26}/><strong>No interactions recorded yet</strong><p>Generate suggestions, then accept, reject or edit an idea to see your interaction log.</p></div> : <div className="event-list">{events.map(ev => <div className="event-row" key={ev.id}><span className="event-time">{ev.time}</span><strong>{ev.action}</strong><span>{ev.detail || ev.suggestionId}</span></div>)}</div>}
          </div>
          <div className="panel study-note"><h3><Heart size={17}/> Research ethics reminder</h3><p>Before collecting data from participants, provide a clear information sheet, obtain informed consent, minimize personal data, and seek your professor's approval. Do not treat these prototype metrics as evidence until the study is conducted and analyzed.</p></div>
          <button className="outline-button" onClick={() => setTab('workspace')}>Back to workspace <ArrowRight size={15}/></button>
        </div>}
      </main>
    </div>
  );
}

export default App;
