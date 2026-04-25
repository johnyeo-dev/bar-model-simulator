import { useState, useEffect, useRef } from "react";

const U = 40, B = 110;

const P1_STEPS = [
  {
    t: "Before the Transfer",
    d: "Kim has 256 MORE paper clips than Jimmy. The orange block shows Kim's extra.",
    bA: [{w:B+U,c:"#bfdbfe",l:""},{w:72,c:"#fdba74",l:"256"}],
    bB: [{w:B+U,c:"#bfdbfe",l:""}],
  },
  {
    t: "Marking the Unknown 'u'",
    d: "We label an equal unknown part 'u' on both bars. The green 'u' on Kim's bar is what she will give (along with 256). The dashed 'u' on Jimmy is a placeholder.",
    bA: [{w:B,c:"#bfdbfe",l:""},{w:U,c:"#bbf7d0",l:"u"},{w:72,c:"#fdba74",l:"256"}],
    bB: [{w:B,c:"#bfdbfe",l:""},{w:U,c:"#d1d5db",l:"u",dim:1}],
  },
  {
    t: "Kim Gives u + 256 to Jimmy",
    d: "Kim gives the pulsing 'u' block AND the '256' block to Jimmy. Total given = u + 256 (we'll find the exact value soon!).",
    bA: [{w:B,c:"#bfdbfe",l:""},{w:U,c:"#fde047",l:"u",mov:1},{w:72,c:"#fde047",l:"256",mov:1}],
    bB: [{w:B,c:"#bfdbfe",l:""},{w:U,c:"#d1d5db",l:"u",dim:1}],
    arrow: "Kim gives u + 256 paper clips to Jimmy",
  },
  {
    t: "After the Transfer — It Flipped!",
    d: "Now Jimmy has 316 MORE than Kim! The longer bar switched to Jimmy. This is the 'flip' type.",
    bA: [{w:B,c:"#bfdbfe",l:""}],
    bB: [{w:B,c:"#bfdbfe",l:""},{w:U,c:"#bbf7d0",l:"u"},{w:72,c:"#fde68a",l:"256"},{w:U,c:"#bbf7d0",l:"u"}],
    brB: {off:B, w:U+72+U, label:"316 more"},
  },
  {
    t: "Finding 2u",
    d: "The two green 'u' blocks sit on either side of the 256. Together they fill the 316 gap. So: 2u = 316 - 256.",
    bA: [{w:B,c:"#bfdbfe",l:""}],
    bB: [{w:B,c:"#bfdbfe",l:""},{w:U,c:"#4ade80",l:"u",hl:1},{w:72,c:"#fde68a",l:"256"},{w:U,c:"#4ade80",l:"u",hl:1}],
    brB: {off:B, w:U+72+U, label:"316 more"},
    work: ["2u = 316 - 256","   = 60"],
  },
  {
    t: "Finding 1u",
    d: "Divide 60 by 2 to find the value of one unit.",
    bA: [{w:B,c:"#bfdbfe",l:""}],
    bB: [{w:B,c:"#bfdbfe",l:""},{w:U,c:"#4ade80",l:"30",hl:1},{w:72,c:"#fde68a",l:"256"},{w:U,c:"#4ade80",l:"30",hl:1}],
    brB: {off:B, w:U+72+U, label:"316 more"},
    work: ["2u = 316 - 256","   = 60","1u = 60 / 2 = 30"],
  },
  {
    t: "Answer: Kim Gave 286 Paper Clips!",
    d: "Kim gave = 1u + 256 = 30 + 256 = 286 paper clips.",
    bA: [{w:B,c:"#bfdbfe",l:""}],
    bB: [{w:B,c:"#bfdbfe",l:""},{w:U,c:"#4ade80",l:"30"},{w:72,c:"#fde68a",l:"256"},{w:U,c:"#4ade80",l:"30"}],
    brB: {off:B, w:U+72+U, label:"316 more"},
    work: ["Kim gave = 1u + 256","        = 30 + 256","        = 286 paper clips"],
    win: 1,
  },
];

const P2_STEPS = [
  {
    t: "Before the Transfer",
    d: "Wilson has 452 MORE cards than Derrick. The orange block shows Wilson's extra.",
    bA: [{w:150,c:"#ddd6fe",l:""},{w:U*2+68,c:"#fdba74",l:"452"}],
    bB: [{w:150,c:"#ddd6fe",l:""}],
  },
  {
    t: "Splitting Wilson's 452 Extra",
    d: "Since the final gap is 158, we know: 452 = 2u + 158. Split it into: 1u (to give) + 1u (to keep) + 158 (remaining gap).",
    bA: [{w:150,c:"#ddd6fe",l:""},{w:U,c:"#fde047",l:"u"},{w:U,c:"#bbf7d0",l:"u"},{w:68,c:"#fdba74",l:"158"}],
    bB: [{w:150,c:"#ddd6fe",l:""}],
    sub: "Check: u + u + 158 = 2u + 158 = 452",
  },
  {
    t: "Wilson Gives 1u to Derrick",
    d: "Wilson gives the pulsing yellow 'u' block to Derrick. The green 'u' and '158' stay with Wilson.",
    bA: [{w:150,c:"#ddd6fe",l:""},{w:U,c:"#fde047",l:"u",mov:1},{w:U,c:"#bbf7d0",l:"u"},{w:68,c:"#fdba74",l:"158"}],
    bB: [{w:150,c:"#ddd6fe",l:""}],
    arrow: "Wilson gives u cards to Derrick",
  },
  {
    t: "After the Transfer — Same Order",
    d: "Wilson still leads, but now only 158 more. Derrick gained 1u. Same person leads, smaller gap!",
    bA: [{w:150,c:"#ddd6fe",l:""},{w:U,c:"#bbf7d0",l:"u"},{w:68,c:"#fdba74",l:"158"}],
    bB: [{w:150,c:"#ddd6fe",l:""},{w:U,c:"#bbf7d0",l:"u"}],
    brA: {off:150+U, w:68, label:"158 more"},
  },
  {
    t: "Finding 2u",
    d: "One 'u' on Wilson's bar + one 'u' on Derrick's bar = the change in the gap. So: 2u = 452 - 158.",
    bA: [{w:150,c:"#ddd6fe",l:""},{w:U,c:"#4ade80",l:"u",hl:1},{w:68,c:"#fdba74",l:"158"}],
    bB: [{w:150,c:"#ddd6fe",l:""},{w:U,c:"#4ade80",l:"u",hl:1}],
    brA: {off:150+U, w:68, label:"158 more"},
    work: ["2u = 452 - 158","   = 294"],
  },
  {
    t: "Finding 1u",
    d: "Divide 294 by 2.",
    bA: [{w:150,c:"#ddd6fe",l:""},{w:U,c:"#4ade80",l:"147",hl:1},{w:68,c:"#fdba74",l:"158"}],
    bB: [{w:150,c:"#ddd6fe",l:""},{w:U,c:"#4ade80",l:"147",hl:1}],
    brA: {off:150+U, w:68, label:"158 more"},
    work: ["2u = 452 - 158","   = 294","1u = 294 / 2 = 147"],
  },
  {
    t: "Answer: Wilson Gave 147 Cards!",
    d: "Wilson gave = 1u = 147 cards.",
    bA: [{w:150,c:"#ddd6fe",l:""},{w:U,c:"#4ade80",l:"147"},{w:68,c:"#fdba74",l:"158"}],
    bB: [{w:150,c:"#ddd6fe",l:""},{w:U,c:"#4ade80",l:"147"}],
    brA: {off:150+U, w:68, label:"158 more"},
    work: ["Wilson gave = 1u","           = 147 cards"],
    win: 1,
  },
];

const PROBS = [
  { q:"Kim had 256 more paper clips than Jimmy. She gave Jimmy some paper clips. In the end, Jimmy had 316 more than Kim. How many paper clips did Kim give Jimmy?", pA:"K", pB:"J", col:"#2563eb", bg:"#eff6ff", steps:P1_STEPS },
  { q:"Wilson had 452 more cards than Derrick. He gave Derrick some cards. In the end, Wilson had 158 more cards than Derrick. How many cards did Wilson give Derrick?", pA:"W", pB:"D", col:"#7c3aed", bg:"#f5f3ff", steps:P2_STEPS },
];

const BTN = {padding:"9px 18px",borderRadius:10,border:"1px solid #e2e8f0",cursor:"pointer",fontWeight:700,fontSize:13,transition:"all 0.15s"};

function BarRow({label, segs, col}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
      <div style={{width:24,textAlign:"right",fontWeight:800,fontSize:15,color:col,flexShrink:0}}>{label}</div>
      <div style={{display:"flex",height:48,borderRadius:7,overflow:"hidden",boxShadow:"0 2px 6px rgba(0,0,0,0.1)"}}>
        {segs.map((s,i) => (
          <div key={i} style={{
            width:s.w, background:s.c,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize: s.l && s.l.length > 4 ? 9 : 11,
            fontWeight: s.hl ? 800 : 600,
            color:"#1e293b",
            borderRight: i < segs.length-1 ? "2px solid rgba(0,0,0,0.1)" : "none",
            border: s.dim ? "2px dashed #94a3b8" : undefined,
            boxSizing:"border-box",
            transition:"all 0.4s ease",
            animation: s.hl ? "glow 1s ease-in-out infinite alternate" : s.mov ? "pulse 0.6s ease-in-out infinite" : "none",
            whiteSpace:"nowrap",
          }}>{s.l}</div>
        ))}
      </div>
    </div>
  );
}

function Bracket({off, w, label}) {
  return (
    <div style={{paddingLeft: 32 + off, marginBottom:4}}>
      <div style={{
        width:w,
        borderBottom:"2.5px solid #f97316",
        borderLeft:"2.5px solid #f97316",
        borderRight:"2.5px solid #f97316",
        padding:"3px 0",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:11, fontWeight:700, color:"#ea580c",
      }}>{label}</div>
    </div>
  );
}

export default function Sim() {
  const [pi, setPi] = useState(0);
  const [step, setStep] = useState(0);
  const [play, setPlay] = useState(false);
  const [vis, setVis] = useState(true);
  const tmr = useRef(null);

  const prob = PROBS[pi];
  const s = prob.steps[step];
  const N = prob.steps.length;

  const goto = (n) => {
    setVis(false);
    setTimeout(() => { setStep(n); setVis(true); }, 180);
  };

  useEffect(() => {
    if (play) {
      tmr.current = setInterval(() => {
        setStep(c => {
          if (c >= N - 1) { setPlay(false); return c; }
          setVis(false);
          setTimeout(() => setVis(true), 180);
          return c + 1;
        });
      }, 2500);
    }
    return () => clearInterval(tmr.current);
  }, [play, N, pi]);

  const reset = (i) => {
    clearInterval(tmr.current);
    setPlay(false);
    setStep(0);
    setPi(i);
    setVis(true);
  };

  const LEGEND = [["#bfdbfe","Equal base"],["#bbf7d0","u unit"],["#fdba74","Difference"],["#fde047","Transferring"]];

  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",maxWidth:560,margin:"0 auto",padding:16,background:"#f0f4f8",minHeight:"100vh"}}>

      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:20,fontWeight:900,color:"#0f172a"}}>Bar Model Simulator</div>
        <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>PSLE Maths - Internal Transfer</div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {PROBS.map((p, i) => (
          <button key={i} onClick={() => reset(i)} style={{
            ...BTN, flex:1, padding:"10px 12px", textAlign:"left",
            background: pi===i ? p.col : "#fff",
            color: pi===i ? "#fff" : "#475569",
            borderColor: pi===i ? p.col : "#e2e8f0",
          }}>
            <div style={{fontWeight:800,fontSize:12}}>{i===0 ? "Kim & Jimmy" : "Wilson & Derrick"}</div>
            <div style={{fontWeight:400,fontSize:10,opacity:0.8}}>{i===0 ? "Transfer flips the order" : "Transfer keeps same order"}</div>
          </button>
        ))}
      </div>

      <div style={{background:prob.bg,borderLeft:`4px solid ${prob.col}`,borderRadius:8,padding:"9px 13px",marginBottom:14,fontSize:12.5,color:"#334155",lineHeight:1.7}}>
        <strong>Q:</strong> {prob.q}
      </div>

      <div style={{background:"#fff",borderRadius:14,padding:20,boxShadow:"0 4px 16px rgba(0,0,0,0.07)",opacity:vis?1:0,transition:"opacity 0.18s ease",minHeight:340}}>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{display:"flex",gap:5}}>
            {prob.steps.map((_, i) => (
              <div key={i} onClick={() => goto(i)} style={{
                width: i===step ? 22 : 7, height:7, borderRadius:4,
                background: i < step ? "#86efac" : i===step ? prob.col : "#e2e8f0",
                cursor:"pointer", transition:"all 0.3s",
              }} />
            ))}
          </div>
          <span style={{fontSize:11,color:"#94a3b8"}}>Step {step+1}/{N}</span>
        </div>

        <div style={{fontSize:16,fontWeight:800,color:s.win?"#15803d":prob.col,marginBottom:5}}>{s.win ? "🎉 " : ""}{s.t}</div>
        <div style={{fontSize:13,color:"#475569",marginBottom:14,lineHeight:1.65}}>{s.d}</div>

        {s.arrow && (
          <div style={{background:"#fff7ed",border:"1px dashed #f97316",borderRadius:8,padding:"6px 12px",marginBottom:10,fontSize:12,fontWeight:700,color:"#c2410c",textAlign:"center"}}>
            {s.arrow}
          </div>
        )}

        <div style={{background:"#f8fafc",borderRadius:10,padding:"14px 10px 8px",marginBottom:12}}>
          <BarRow label={prob.pA} segs={s.bA} col={prob.col} />
          {s.brA && <Bracket off={s.brA.off} w={s.brA.w} label={s.brA.label} />}
          <div style={{height:8}} />
          <BarRow label={prob.pB} segs={s.bB} col={prob.col} />
          {s.brB && <Bracket off={s.brB.off} w={s.brB.w} label={s.brB.label} />}
        </div>

        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}>
          {LEGEND.map(([c,l]) => (
            <div key={l} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#64748b"}}>
              <div style={{width:10,height:10,borderRadius:2,background:c,border:"1px solid rgba(0,0,0,0.1)"}} />
              {l}
            </div>
          ))}
        </div>

        {s.sub && (
          <div style={{fontSize:11.5,color:"#64748b",marginBottom:10,fontStyle:"italic",background:"#f8fafc",padding:"6px 10px",borderRadius:6}}>
            {s.sub}
          </div>
        )}

        {s.work && (
          <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"10px 14px",fontFamily:"monospace",fontSize:13,color:"#166534",lineHeight:1.9}}>
            {s.work.map((line, i) => <div key={i}>{line}</div>)}
          </div>
        )}

        {s.win && <div style={{textAlign:"center",fontSize:26,marginTop:10}}>🎉 🌟 ✨ 🏆</div>}
      </div>

      <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:14}}>
        <button onClick={() => { setPlay(false); goto(Math.max(0, step-1)); }} disabled={step===0}
          style={{...BTN, background:step===0?"#f1f5f9":"#fff", color:step===0?"#cbd5e1":"#334155", cursor:step===0?"default":"pointer"}}>
          Back
        </button>
        <button onClick={() => setPlay(!play)}
          style={{...BTN, background:prob.col, color:"#fff", width:108, textAlign:"center", border:"none"}}>
          {play ? "Pause" : "Play"}
        </button>
        <button onClick={() => { setPlay(false); goto(Math.min(N-1, step+1)); }} disabled={step===N-1}
          style={{...BTN, background:step===N-1?"#f1f5f9":"#fff", color:step===N-1?"#cbd5e1":"#334155", cursor:step===N-1?"default":"pointer"}}>
          Next
        </button>
      </div>
      <div style={{textAlign:"center",marginTop:8}}>
        <button onClick={() => reset(pi)} style={{background:"none",border:"none",fontSize:12,color:"#94a3b8",cursor:"pointer"}}>
          Restart
        </button>
      </div>

      <style>{`
        @keyframes glow {
          from { filter: brightness(1); box-shadow: 0 0 0px rgba(74,222,128,0); }
          to { filter: brightness(1.12); box-shadow: 0 0 10px rgba(74,222,128,0.6); }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.07); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
