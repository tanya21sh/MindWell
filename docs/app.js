(function(){
  // Check that React is available (if CDN blocked or network failed, show friendly error)
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined'){
    const root = document.getElementById('root');
    if (root){
      root.innerHTML = '';
      const box = document.createElement('div');
      box.style.padding = '18px';
      box.style.border = '1px solid #f2c2c2';
      box.style.background = '#fff7f7';
      box.style.color = '#7a1a1a';
      box.style.borderRadius = '8px';
      box.style.maxWidth = '720px';
      box.innerHTML = '<strong>React failed to load</strong><div style="margin-top:8px">The required scripts (React/ReactDOM) did not load. This can happen when the CDN is blocked or your network prevents loading from unpkg.com. Try reloading the page, or allow access to <code>https://unpkg.com</code>.</div>';
      root.appendChild(box);
    }
    return;
  }

  const e = React.createElement;
  const { useState, useRef, useEffect } = React;

  const PHQ9 = [
    'Little interest or pleasure in doing things',
    'Feeling down, depressed, or hopeless',
    'Trouble falling or staying asleep, or sleeping too much',
    'Feeling tired or having little energy',
    'Poor appetite or overeating',
    'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
    'Trouble concentrating on things, such as reading the newspaper or watching television',
    'Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving a lot more than usual',
    'Thoughts that you would be better off dead or of hurting yourself in some way'
  ];

  const GAD7 = [
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying',
    'Worrying too much about different things',
    'Trouble relaxing',
    'Being so restless that it is hard to sit still',
    'Becoming easily annoyed or irritable',
    'Feeling afraid as if something awful might happen'
  ];

  function scoreInterpretPHQ9(score){
    let level = 'Minimal or none';
    if (score >= 20) level = 'Severe';
    else if (score >= 15) level = 'Moderately severe';
    else if (score >= 10) level = 'Moderate';
    else if (score >= 5) level = 'Mild';
    return level;
  }

  function scoreInterpretGAD7(score){
    let level = 'Minimal or none';
    if (score >= 15) level = 'Severe';
    else if (score >= 10) level = 'Moderate';
    else if (score >= 5) level = 'Mild';
    return level;
  }

  function detectConditions(text){
    const t = (text||'').toLowerCase();
    const findings = [];
    const push = (name) => { if (!findings.includes(name)) findings.push(name); };

    if (/suicid|kill myself|better off dead/.test(t)) push('Suicidal thoughts (urgent)');
    if (/depress|hopeless|sad|unhappy|down|worthless/.test(t)) push('Depression');
    if (/anxiet|panic|worry|nervous|restless|fearful/.test(t)) push('Anxiety disorders');
    if (/insomni|sleep problem|can\'t sleep|trouble sleeping/.test(t)) push('Sleep problems / Insomnia');
    if (/alcohol|drink too much|drugs|substance/.test(t)) push('Substance use concerns');
    if (/ocd|obsess|compulsiv/.test(t)) push('Obsessive–compulsive tendencies');
    if (/ptsd|trauma|flashback/.test(t)) push('Post-traumatic stress');
    if (/add|adhd|attention deficit|easily distracted/.test(t)) push('Attention difficulties (possible ADHD)');

    return findings;
  }

  function overallRating(phqScore, gadScore, flaggedUrgent){
    if (flaggedUrgent || phqScore >= 20 || gadScore >= 15) return 'Worst';
    if (phqScore >= 10 || gadScore >= 10) return 'Bad';
    return 'Good';
  }

  function formatTime(iso){
    try{ const d = new Date(iso); return d.toLocaleString(); }catch(e){ return iso }
  }

  function ChatMessage({m}){
    const isBot = m.from === 'bot';
    const avatar = isBot ? e('div', { className: 'msg-avatar bot' }, 'MW') : e('div', { className: 'msg-avatar user' }, 'You');
    return e('div', { className: 'chat-row' },
      avatar,
      e('div', { className: 'msg-body' },
        e('div', { className: `chat-msg ${isBot ? 'bot' : 'user'}` }, e('div', { className: 'msg-text' }, m.text)),
        e('div', { className: 'msg-meta' }, formatTime(m.timestamp || m.time || new Date().toISOString()))
      )
    );
  }

  function App(){
    const [messages, setMessages] = useState([
      { from: 'bot', text: 'Hi — I\'m MindWell. I can ask a few questions to understand how you\'re feeling. This is a prototype and not a diagnosis. For emergencies, contact local emergency services.', timestamp: new Date().toISOString() },
      { from: 'bot', text: 'Can you briefly describe what\'s been bothering you recently? You can type freely.', timestamp: new Date().toISOString() }
    ]);

    const [phase, setPhase] = useState('open');
    const [phqAnswers, setPhqAnswers] = useState(Array(PHQ9.length).fill(null));
    const [gadAnswers, setGadAnswers] = useState(Array(GAD7.length).fill(null));
    const [currentQ, setCurrentQ] = useState({ type: 'open' , index: 0});
    const [input, setInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const bottomRef = useRef(null);

      pushMessage({ from: 'user', text: text.trim() });

    function pushMessage(m){
      if (!m.timestamp) m.timestamp = new Date().toISOString();
      setMessages(prev => [...prev, m]);
    }

    function handleUserTextSend(text){
      if (!text || !text.trim()) return;
      pushMessage({ from: 'user', text: text.trim() });

      if (phase === 'open'){
        setTimeout(()=>{
          pushMessage({ from: 'bot', text: 'Thanks. I\'ll ask a few short questions about mood and anxiety. Please select the option that best matches how often you experienced each item in the last 2 weeks.' });
          setPhase('phq');
          setCurrentQ({ type: 'phq', index: 0 });
          pushMessage({ from: 'bot', text: `PHQ-9: 1) ${PHQ9[0]}` });
        }, 600);
      } else if (phase === 'more'){
        setTimeout(()=> finalizeAssessment(), 600);
      }
    }

    function answerOption(value){
      if (currentQ.type === 'phq'){
        const idx = currentQ.index;
        const copy = phqAnswers.slice(); copy[idx] = value; setPhqAnswers(copy);
        pushMessage({ from: 'user', text: ['Not at all','Several days','More than half the days','Nearly every day'][value] });
        const next = idx + 1;
        if (next < PHQ9.length){
          setCurrentQ({ type: 'phq', index: next });
          setTimeout(()=> pushMessage({ from: 'bot', text: `PHQ-9: ${next+1}) ${PHQ9[next]}` }), 400);
        } else {
          setPhase('gad');
          setCurrentQ({ type: 'gad', index: 0 });
          setTimeout(()=> pushMessage({ from: 'bot', text: `GAD-7: 1) ${GAD7[0]}` }), 500);
        }
      } else if (currentQ.type === 'gad'){
        const idx = currentQ.index;
        const copy = gadAnswers.slice(); copy[idx] = value; setGadAnswers(copy);
        pushMessage({ from: 'user', text: ['Not at all','Several days','More than half the days','Nearly every day'][value] });
        const next = idx + 1;
        if (next < GAD7.length){
          setCurrentQ({ type: 'gad', index: next });
          setTimeout(()=> pushMessage({ from: 'bot', text: `GAD-7: ${next+1}) ${GAD7[next]}` }), 400);
        } else {
          setPhase('more');
          setCurrentQ({ type: 'more' });
          setTimeout(()=> pushMessage({ from: 'bot', text: 'Thanks. Anything else you\'d like to share? (optional)'}), 500);
        }
      }
    }

    function finalizeAssessment(){
      const phqScore = phqAnswers.reduce((s,v)=>s+Number(v||0),0);
      const gadScore = gadAnswers.reduce((s,v)=>s+Number(v||0),0);
      const phqLevel = scoreInterpretPHQ9(phqScore);
      const gadLevel = scoreInterpretGAD7(gadScore);

      const userText = messages.filter(m=>m.from==='user').map(m=>m.text).join(' ');
      const conditions = detectConditions(userText);
      const rating = overallRating(phqScore, gadScore, flaggedUrgent);

      const rating = overallRating(phqScore, gadScore, flaggedUrgent);

      let summary = `Summary:\nPHQ-9: ${phqScore} (${phqLevel}). GAD-7: ${gadScore} (${gadLevel}). Overall rating: ${rating}.`;
      if (conditions.length) summary += '\nPossible concerns: ' + conditions.join(', ') + '.';
      if (flaggedUrgent) summary += '\nUrgent note: suicidal thoughts detected. Please contact local emergency services or a crisis line immediately.';

      pushMessage({ from: 'bot', text: 'Analyzing your responses...' });

      setTimeout(()=>{
        pushMessage({ from: 'bot', text: summary });
        // Suggested next steps
        const suggestions = [];
        if (flaggedUrgent) suggestions.push('Contact local emergency services or a crisis hotline immediately.');
        if (phqScore >= 10) suggestions.push('Consider seeking a professional mental health assessment for depression.');
        if (gadScore >= 10) suggestions.push('Consider talking to a counselor about anxiety management.');        if (!flaggedUrgent && phqScore < 10 && gadScore < 10) suggestions.push('Symptoms appear mild; monitor and reach out if they worsen.');

        if (suggestions.length){
          pushMessage({ from: 'bot', text: 'Suggested next steps:\n' + suggestions.join('\n') });
        }

        // save to browser localStorage (client-only mode)
        const payload = {
          timestamp: new Date().toISOString(),
          transcript: messages.concat([]),
          phqAnswers, gadAnswers, phqScore, gadScore, phqLevel, gadLevel, conditions, rating, flaggedUrgent
        };

        try{
          const stored = JSON.parse(localStorage.getItem('mindwell_responses') || '[]');
          stored.push(payload);
          localStorage.setItem('mindwell_responses', JSON.stringify(stored));
          pushMessage({ from: 'bot', text: 'Saved locally to your browser (localStorage). You can download your data with the "Download data" button.' });
        } catch (err){
          console.error('local save failed', err);
          pushMessage({ from: 'bot', text: 'Could not save locally — your browser may block storage.' });
        }

        setTimeout(()=>{ setPhase('done'); }, 200);

      }, 1000);
    }

    function handleSubmit(e){
      e && e.preventDefault();
      const text = input.trim();
      setInput('');
      if (!text) return;
      handleUserTextSend(text);
    }

    // Determine what quick-reply options to show
    let quickOptions = null;
    if (currentQ.type === 'phq' || currentQ.type === 'gad'){
      quickOptions = ['Not at all','Several days','More than half the days','Nearly every day'];
    }

    function downloadData(){
      try{
        const stored = localStorage.getItem('mindwell_responses') || '[]';
        const blob = new Blob([stored], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mindwell_responses_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err){ console.error('download failed', err); }
    }

    function clearData(){
      if (confirm('Clear all saved responses from your browser? This cannot be undone.')){
        localStorage.removeItem('mindwell_responses');
        pushMessage({ from: 'bot', text: 'Local saved responses cleared.' });
      }
    }

    return e('div', null,
      e('div', { className: 'header-row' },
        e('div', { style: { display:'flex', alignItems:'center', gap:12 } },
          e('div', { className: 'brand-mark' }, 'MW'),
          e('div', null, e('h1', null, 'MindWell'), e('div', { className: 'tagline' }, 'A friendly mental-health chatbot — prototype'))
        ),
        e('div', { className: 'small' }, 'Private — data stays in your browser')
      ),

      e('div', { className: 'chat-wrap' },
        e('div', { className: 'chat-window' },
          messages.map((m,i)=> e('div', { key: i }, e(ChatMessage, { m }))),
          e('div', { ref: bottomRef })
        )
      ),

      quickOptions ? e('div', { className: 'options' },
        quickOptions.map((opt, idx)=> e('button', { key: idx, onClick: ()=>answerOption(idx) }, opt))
      ) : null,

      e('form', { onSubmit: handleSubmit, className: 'form-row' },
        e('input', {
          value: input,
          onChange: (ev)=>setInput(ev.target.value),
          placeholder: quickOptions ? 'You can also send a message — quick options are shown above' : 'Type your message here',
          onKeyDown: (ev)=>{ if (ev.key === 'Enter' && !ev.shiftKey){ ev.preventDefault(); handleSubmit(); } },
          type: 'text'
        }),
        e('button', { type: 'submit', className: 'send-btn' },
          e('svg', { className: 'send-icon', viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            e('path', { d: 'M2 21l21-9L2 3v7l15 2-15 2v7z', fill: 'currentColor' })
          ),
          'Send'
        )
      ),

      e('div', { className: 'controls' },
        e('button', { onClick: downloadData }, 'Download data'),
        e('button', { onClick: clearData }, 'Clear saved responses')
      ),

      submitting ? e('div', { className: 'small' }, 'Saving...') : null,

      e('footer', { className: 'footer-note' }, 'Prototype only — not a replacement for professional help. For urgent help contact local emergency services or a crisis line.')
    );
  }

  try{
    ReactDOM.createRoot(document.getElementById('root')).render(e(App));
  } catch (err){
    console.error('Render error', err);
    const root = document.getElementById('root');
    if (root){
      root.innerHTML = '';
      const pre = document.createElement('pre');
      pre.style.background = 'rgba(255,240,240,0.95)';
      pre.style.color = '#900';
      pre.style.padding = '12px';
      pre.style.border = '1px solid #f2c2c2';
      pre.style.borderRadius = '8px';
      pre.style.whiteSpace = 'pre-wrap';
      pre.textContent = 'Application error:\n' + (err && err.stack ? err.stack : String(err));
      root.appendChild(pre);
    }
  }

  window.addEventListener('error', function(e){
    const root = document.getElementById('root');
    if (root){
      const el = document.createElement('pre');
      el.style.background = 'rgba(255,240,240,0.95)';
      el.style.color = '#900';
      el.style.padding = '12px';
      el.style.border = '1px solid #f2c2c2';
      el.style.borderRadius = '8px';
      el.style.whiteSpace = 'pre-wrap';
      el.textContent = 'Uncaught error:\n' + (e && e.error && e.error.stack ? e.error.stack : e.message || String(e));
      root.appendChild(el);
    }
    console.error(e.error || e.message || e);
  });

})();
