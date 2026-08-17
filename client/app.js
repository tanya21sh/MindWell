(function(){
  const e = React.createElement;
  const { useState } = React;

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

  function Question({text, value, onChange}){
    return e('div', { className: 'question' },
      e('div', null, text),
      e('div', { className: 'radio-row' }, [0,1,2,3].map(n =>
        e('label', { key: n },
          e('input', { type: 'radio', name: text, value: n, checked: value===n, onChange: ()=>onChange(n) }),
          ' ', ['Not at all','Several days','More than half the days','Nearly every day'][n]
        )
      ))
    );
  }

  function App(){
    const [step, setStep] = useState('intro');
    const [phq, setPhq] = useState(Array(PHQ9.length).fill(null));
    const [gad, setGad] = useState(Array(GAD7.length).fill(null));
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    function allAnswered(arr){ return arr.every(v => v !== null); }

    function submit(){
      const phqScore = phq.reduce((s,v)=>s+Number(v),0);
      const gadScore = gad.reduce((s,v)=>s+Number(v),0);
      const phqLevel = scoreInterpretPHQ9(phqScore);
      const gadLevel = scoreInterpretGAD7(gadScore);
      const payload = { phqScore, phqLevel, gadScore, gadLevel, phq, gad };
      setSubmitting(true);
      fetch('/api/submit', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
        .then(r=>r.json())
        .then(data => {
          setResult(payload);
        })
        .catch(err => {
          console.error(err);
          setResult(payload);
        })
        .finally(()=> setSubmitting(false));
    }

    if (step === 'intro'){
      return e('div', null,
        e('h1', null, 'MindWell — Quick Mental Health Check'),
        e('p', null, 'This short prototype uses PHQ-9 and GAD-7 style questions to give a simple assessment. It is not a diagnosis. For emergencies, contact local emergency services.'),
        e('div', null,
          e('button', { onClick: ()=>setStep('phq') }, 'Start')
        ),
        e('footer', null, 'Responses are saved to the server JSON file for demo purposes. No external APIs used.')
      );
    }

    if (step === 'phq'){
      return e('div', null,
        e('h2', null, 'PHQ-9 (Depression)'),
        PHQ9.map((q,i)=> e(Question, { key: i, text: `${i+1}. ${q}`, value: phq[i], onChange: v => { const c = phq.slice(); c[i]=v; setPhq(c); } })),
        e('div', null,
          e('button', { onClick: ()=>setStep('gad') , disabled: !allAnswered(phq)}, 'Next')
        )
      );
    }

    if (step === 'gad'){
      return e('div', null,
        e('h2', null, 'GAD-7 (Anxiety)'),
        GAD7.map((q,i)=> e(Question, { key: i, text: `${i+1}. ${q}`, value: gad[i], onChange: v => { const c = gad.slice(); c[i]=v; setGad(c); } })),
        e('div', null,
          e('button', { onClick: ()=>setStep('review'), disabled: !allAnswered(gad) }, 'Review & Submit')
        )
      );
    }

    if (step === 'review'){
      const phqScore = phq.reduce((s,v)=>s+Number(v),0);
      const gadScore = gad.reduce((s,v)=>s+Number(v),0);
      return e('div', null,
        e('h2', null, 'Review'),
        e('div', null, e('strong', null, 'PHQ-9 score: '), phqScore, ' — ', scoreInterpretPHQ9(phqScore)),
        e('div', null, e('strong', null, 'GAD-7 score: '), gadScore, ' — ', scoreInterpretGAD7(gadScore)),
        e('div', null,
          e('button', { onClick: submit, disabled: submitting }, submitting ? 'Submitting...' : 'Submit')
        ),
        e('div', null,
          e('button', { onClick: ()=>setStep('phq') }, 'Edit PHQ-9'),
          e('button', { onClick: ()=>setStep('gad') }, 'Edit GAD-7')
        )
      );
    }

    if (result){
      return e('div', null,
        e('h2', null, 'Results'),
        e('div', { className: 'result' },
          e('div', null, e('strong', null, 'PHQ-9 score: '), result.phqScore, ' — ', result.phqLevel),
          e('div', null, e('strong', null, 'GAD-7 score: '), result.gadScore, ' — ', result.gadLevel),
          e('div', null, e('p', null, 'Suggested next steps:')),
          e('ul', null,
            result.phqScore >= 10 ? e('li', null, 'Consider seeking a professional mental health assessment.') : null,
            result.gadScore >= 10 ? e('li', null, 'Consider talking to a counselor about anxiety management.') : null,
            (result.phqScore < 10 && result.gadScore < 10) ? e('li', null, 'Results suggest mild or no significant symptoms. Keep monitoring and reach out if things change.') : null
          )
        ),
        e('div', null, e('button', { onClick: ()=>{ setStep('intro'); setPhq(Array(PHQ9.length).fill(null)); setGad(Array(GAD7.length).fill(null)); setResult(null); } }, 'Take again')),
        e('footer', null, 'This tool is a prototype and not a replacement for professional help.')
      );
    }

    return null;
  }

  ReactDOM.createRoot(document.getElementById('root')).render(e(App));
})();
