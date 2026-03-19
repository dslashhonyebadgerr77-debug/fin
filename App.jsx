import { useState, useEffect, useRef } from "react";

// ── Fonts via Google ──────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#0b0f19;--bg2:#111827;--bg3:#1a2235;--bg4:#1f2d40;
      --card:#162032;--card2:#1c2a3f;
      --accent:#4ade80;--accent2:#22d3ee;--accent3:#f59e0b;--accent4:#f472b6;
      --text:#e8edf5;--muted:#6b7fa3;--border:#243047;
      --red:#f87171;--yellow:#fbbf24;--purple:#a78bfa;
      --font-head:'Cabinet Grotesk',sans-serif;
      --font-body:'DM Sans',sans-serif;
      --radius:14px;--radius-sm:8px;--shadow:0 4px 24px rgba(0,0,0,.4);
    }
    html{scroll-behavior:smooth}
    body{background:var(--bg);color:var(--text);font-family:var(--font-body);min-height:100vh;overflow-x:hidden}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--bg2)}::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:99px}
  `}</style>
);

// ── Mock Data ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id:"food", label:"Food & Dining", icon:"🍔", color:"#4ade80" },
  { id:"transport", label:"Transport", icon:"🚌", color:"#22d3ee" },
  { id:"shopping", label:"Shopping", icon:"🛍️", color:"#f472b6" },
  { id:"entertainment", label:"Entertainment", icon:"🎬", color:"#a78bfa" },
  { id:"health", label:"Health", icon:"💊", color:"#f59e0b" },
  { id:"education", label:"Education", icon:"📚", color:"#34d399" },
  { id:"utilities", label:"Utilities", icon:"💡", color:"#60a5fa" },
  { id:"other", label:"Other", icon:"📦", color:"#94a3b8" },
];

const INITIAL_EXPENSES = [
  { id:1, title:"Lunch at Cafe", amount:320, cat:"food", date:"2026-03-20", note:"" },
  { id:2, title:"Metro Card", amount:200, cat:"transport", date:"2026-03-19", note:"" },
  { id:3, title:"Netflix", amount:649, cat:"entertainment", date:"2026-03-18", note:"" },
  { id:4, title:"Grocery Run", amount:1150, cat:"food", date:"2026-03-17", note:"" },
  { id:5, title:"New Earphones", amount:2499, cat:"shopping", date:"2026-03-15", note:"" },
  { id:6, title:"Electricity Bill", amount:890, cat:"utilities", date:"2026-03-14", note:"" },
  { id:7, title:"Udemy Course", amount:499, cat:"education", date:"2026-03-12", note:"" },
  { id:8, title:"Doctor Visit", amount:500, cat:"health", date:"2026-03-10", note:"" },
];

const INITIAL_GOALS = [
  { id:1, title:"Emergency Fund", target:50000, saved:18000, deadline:"2026-12-31", icon:"🛡️" },
  { id:2, title:"New Laptop", target:80000, saved:32000, deadline:"2026-08-01", icon:"💻" },
  { id:3, title:"Goa Trip", target:20000, saved:8500, deadline:"2026-05-15", icon:"🏖️" },
];

const BADGES = [
  { id:"first_expense", label:"First Step", desc:"Logged your first expense", icon:"👣", earned:true },
  { id:"week_streak", label:"Week Warrior", desc:"7-day tracking streak", icon:"🔥", earned:true },
  { id:"budget_hero", label:"Budget Hero", desc:"Stayed under budget this month", icon:"🏆", earned:false },
  { id:"saver", label:"Super Saver", desc:"Saved 30% of income", icon:"💎", earned:false },
];

const TIPS = [
  "You spent 28% more on Food this week vs last week.",
  "You're on track to hit your Emergency Fund goal by October!",
  "Entertainment spending is high this month — consider streaming bundles.",
  "Great job! You saved ₹3,200 more than last month.",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const cat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[7];
const today = () => new Date().toISOString().split("T")[0];

// ── Shared UI ─────────────────────────────────────────────────────────────────
const Card = ({ children, style={}, className="" }) => (
  <div style={{ background:"var(--card)", borderRadius:"var(--radius)", border:"1px solid var(--border)", ...style }} className={className}>
    {children}
  </div>
);

const Badge = ({ color="#4ade80", children }) => (
  <span style={{ background:color+"22", color, fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:99, letterSpacing:.5 }}>
    {children}
  </span>
);

const ProgressBar = ({ pct, color="var(--accent)", height=8 }) => (
  <div style={{ background:"var(--bg3)", borderRadius:99, height, overflow:"hidden" }}>
    <div style={{ width:`${Math.min(pct,100)}%`, background:color, height:"100%", borderRadius:99, transition:"width .6s ease" }} />
  </div>
);

const Input = ({ label, ...props }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
    {label && <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, letterSpacing:.5, textTransform:"uppercase" }}>{label}</label>}
    <input {...props} style={{ background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", borderRadius:"var(--radius-sm)", padding:"10px 14px", fontSize:14, fontFamily:"var(--font-body)", outline:"none", width:"100%", ...props.style }} />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
    {label && <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, letterSpacing:.5, textTransform:"uppercase" }}>{label}</label>}
    <select {...props} style={{ background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", borderRadius:"var(--radius-sm)", padding:"10px 14px", fontSize:14, fontFamily:"var(--font-body)", outline:"none", width:"100%", ...props.style }}>
      {children}
    </select>
  </div>
);

const Btn = ({ children, variant="primary", style={}, ...props }) => {
  const base = { padding:"10px 22px", borderRadius:"var(--radius-sm)", fontFamily:"var(--font-body)", fontWeight:600, fontSize:14, cursor:"pointer", border:"none", transition:"all .2s", ...style };
  const vars = {
    primary:{ background:"var(--accent)", color:"#0a1a0e" },
    outline:{ background:"transparent", border:"1px solid var(--border)", color:"var(--text)" },
    ghost:{ background:"var(--bg3)", color:"var(--text)" },
    danger:{ background:"#f8717122", color:"var(--red)", border:"1px solid #f8717133" },
  };
  return <button style={{ ...base, ...vars[variant] }} {...props}>{children}</button>;
};

// ── Mini Charts ───────────────────────────────────────────────────────────────
const PieChart = ({ data, size=140 }) => {
  const total = data.reduce((s,d)=>s+d.value,0);
  let angle = -90;
  const slices = data.map(d=>{
    const a = (d.value/total)*360;
    const s = { ...d, startAngle:angle, endAngle:angle+a };
    angle += a;
    return s;
  });
  const polar=(cx,cy,r,deg)=>{const rad=deg*Math.PI/180;return[cx+r*Math.cos(rad),cy+r*Math.sin(rad)]};
  const arc=(cx,cy,r,s,e)=>{const[sx,sy]=polar(cx,cy,r,s);const[ex,ey]=polar(cx,cy,r,e);const large=e-s>180?1:0;return`M${cx},${cy} L${sx},${sy} A${r},${r} 0 ${large},1 ${ex},${ey} Z`};
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s,i)=>(
        <path key={i} d={arc(size/2,size/2,size/2-4,s.startAngle,s.endAngle)} fill={s.color} opacity={.9} />
      ))}
      <circle cx={size/2} cy={size/2} r={size/2-28} fill="var(--card)" />
    </svg>
  );
};

const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d=>d.value));
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:80, padding:"4px 0" }}>
      {data.map((d,i)=>(
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <div style={{ width:"100%", height:((d.value/max)*72), background:d.color||"var(--accent)", borderRadius:"4px 4px 0 0", minHeight:4, transition:"height .5s ease", opacity:.85 }} />
          <span style={{ fontSize:9, color:"var(--muted)", whiteSpace:"nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const SparkLine = ({ values, color="var(--accent)", width=120, height=40 }) => {
  if (!values.length) return null;
  const max=Math.max(...values), min=Math.min(...values);
  const range=max-min||1;
  const pts=values.map((v,i)=>`${(i/(values.length-1))*width},${height-((v-min)/range)*(height-4)-2}`).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow:"visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── PAGES ─────────────────────────────────────────────────────────────────────

// Landing
const Landing = ({ onEnter }) => {
  const features = [
    { icon:"⚡", title:"Quick Add", desc:"Log expenses in 3 taps — no friction, no complexity." },
    { icon:"📊", title:"Visual Insights", desc:"Charts and trends that make your finances readable at a glance." },
    { icon:"🏆", title:"Gamified Savings", desc:"Earn badges and hit milestones as you save more." },
    { icon:"🤖", title:"Smart Suggestions", desc:"AI-style nudges to keep you on track every month." },
  ];
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      {/* Hero */}
      <div style={{ position:"relative", overflow:"hidden", padding:"80px 24px 60px", textAlign:"center", background:"radial-gradient(ellipse at 50% 0%, #0d2a1a 0%, var(--bg) 70%)" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, backgroundImage:"radial-gradient(circle at 1px 1px, #ffffff08 1px, transparent 0)", backgroundSize:"32px 32px", pointerEvents:"none" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--accent)22", border:"1px solid var(--accent)44", borderRadius:99, padding:"6px 16px", marginBottom:24, fontSize:13, color:"var(--accent)", fontWeight:600 }}>
          <span>✦</span> Designed for Students & Young Professionals
        </div>
        <h1 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(2.4rem,6vw,4rem)", fontWeight:900, lineHeight:1.1, marginBottom:20 }}>
          Empowering<br /><span style={{ color:"var(--accent)" }}>Financial Well-being</span>
        </h1>
        <p style={{ color:"var(--muted)", fontSize:17, maxWidth:520, margin:"0 auto 36px", lineHeight:1.7 }}>
          Stop avoiding your finances. FinFlow makes tracking effortless, budgeting visual, and saving rewarding.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <Btn onClick={onEnter} style={{ padding:"14px 32px", fontSize:16, borderRadius:99 }}>Get Started — It's Free</Btn>
          <Btn variant="outline" onClick={onEnter} style={{ padding:"14px 32px", fontSize:16, borderRadius:99 }}>View Demo</Btn>
        </div>
        <div style={{ marginTop:48, display:"flex", gap:24, justifyContent:"center", flexWrap:"wrap" }}>
          {["₹0 forever free","No credit card","2 min setup"].map(t=>(
            <span key={t} style={{ color:"var(--muted)", fontSize:13 }}>✓ {t}</span>
          ))}
        </div>
      </div>

      {/* Why section */}
      <div style={{ padding:"60px 24px", maxWidth:900, margin:"0 auto", width:"100%" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <h2 style={{ fontFamily:"var(--font-head)", fontSize:"1.8rem", fontWeight:800, marginBottom:12 }}>Why FinFlow?</h2>
          <p style={{ color:"var(--muted)", maxWidth:480, margin:"0 auto" }}>Most budgeting apps are built for accountants. We built this for real people with real lives.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
          {features.map(f=>(
            <Card key={f.title} style={{ padding:24 }}>
              <div style={{ fontSize:28, marginBottom:12 }}>{f.icon}</div>
              <div style={{ fontFamily:"var(--font-head)", fontWeight:700, marginBottom:8, fontSize:15 }}>{f.title}</div>
              <div style={{ color:"var(--muted)", fontSize:13, lineHeight:1.6 }}>{f.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA footer */}
      <div style={{ textAlign:"center", padding:"40px 24px 60px" }}>
        <Btn onClick={onEnter} style={{ padding:"14px 36px", fontSize:16, borderRadius:99 }}>Start Tracking Now →</Btn>
      </div>
    </div>
  );
};

// Auth
const Auth = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [err, setErr] = useState("");
  const handle = () => {
    if (!form.email || !form.password) { setErr("Please fill all fields."); return; }
    if (mode==="signup" && !form.name) { setErr("Name is required."); return; }
    setErr("");
    onLogin(form.name || form.email.split("@")[0]);
  };
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24, background:"radial-gradient(ellipse at 50% 0%, #0d2a1a 0%, var(--bg) 60%)" }}>
      <Card style={{ padding:36, width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>💸</div>
          <h2 style={{ fontFamily:"var(--font-head)", fontWeight:800, fontSize:"1.6rem" }}>FinFlow</h2>
          <p style={{ color:"var(--muted)", fontSize:14, marginTop:4 }}>{mode==="login"?"Welcome back!":"Create your account"}</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {mode==="signup" && <Input label="Full Name" placeholder="Aarav Shah" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />}
          <Input label="Email" type="email" placeholder="you@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
          {err && <p style={{ color:"var(--red)", fontSize:13 }}>{err}</p>}
          <Btn onClick={handle} style={{ width:"100%", padding:"12px", fontSize:15, borderRadius:"var(--radius-sm)", marginTop:4 }}>
            {mode==="login"?"Sign In":"Create Account"}
          </Btn>
          <div style={{ textAlign:"center", fontSize:13, color:"var(--muted)" }}>
            {mode==="login" ? <>No account? <span style={{ color:"var(--accent)", cursor:"pointer", fontWeight:600 }} onClick={()=>setMode("signup")}>Sign up free</span></> :
             <>Already have one? <span style={{ color:"var(--accent)", cursor:"pointer", fontWeight:600 }} onClick={()=>setMode("login")}>Sign in</span></>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, color:"var(--muted)", fontSize:12 }}>
            <div style={{ flex:1, height:1, background:"var(--border)" }} />or<div style={{ flex:1, height:1, background:"var(--border)" }} />
          </div>
          <Btn variant="ghost" onClick={()=>onLogin("Demo User")} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <span>🚀</span> Continue as Demo
          </Btn>
        </div>
      </Card>
    </div>
  );
};

// Dashboard
const Dashboard = ({ expenses, goals, budgets, user }) => {
  const totalSpent = expenses.reduce((s,e)=>s+e.amount,0);
  const balance = 45000 - totalSpent;
  const monthlyBudget = 30000;
  const savings = 12800;

  const catData = CATEGORIES.map(c=>({
    color:c.color, label:c.icon, value:expenses.filter(e=>e.cat===c.id).reduce((s,e)=>s+e.amount,0)
  })).filter(d=>d.value>0);

  const weekData = [
    {label:"Mon",value:480,color:"#4ade8088"},
    {label:"Tue",value:1200,color:"#4ade8088"},
    {label:"Wed",value:320,color:"#4ade8088"},
    {label:"Thu",value:890,color:"#4ade8088"},
    {label:"Fri",value:1650,color:"#22d3ee88"},
    {label:"Sat",value:2100,color:"#22d3ee88"},
    {label:"Sun",value:450,color:"#4ade8088"},
  ];

  const recentExp = [...expenses].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,4);

  return (
    <div style={{ padding:"24px 0", display:"flex", flexDirection:"column", gap:20 }}>
      {/* Greeting */}
      <div>
        <h2 style={{ fontFamily:"var(--font-head)", fontSize:"1.5rem", fontWeight:800 }}>Good morning, {user}! 👋</h2>
        <p style={{ color:"var(--muted)", fontSize:14, marginTop:4 }}>Here's your financial snapshot for March 2026.</p>
      </div>

      {/* Insight banner */}
      <div style={{ background:"linear-gradient(135deg,#0d2a1a,#0a2030)", border:"1px solid #22d3ee33", borderRadius:"var(--radius)", padding:"16px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:20 }}>💡</span>
        <p style={{ fontSize:13, color:"#a7f3d0", lineHeight:1.5 }}>{TIPS[0]}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14 }}>
        {[
          { label:"Available Balance", value:fmt(balance), sub:"after expenses", color:"var(--accent)", icon:"💰" },
          { label:"Spent This Month", value:fmt(totalSpent), sub:`of ${fmt(monthlyBudget)} budget`, color:"var(--accent2)", icon:"📤" },
          { label:"Total Saved", value:fmt(savings), sub:"+₹3,200 vs last month", color:"var(--accent3)", icon:"🏦" },
          { label:"Budget Used", value:`${Math.round((totalSpent/monthlyBudget)*100)}%`, sub:"on track", color:"var(--purple)", icon:"📊" },
        ].map(s=>(
          <Card key={s.label} style={{ padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <span style={{ fontSize:20 }}>{s.icon}</span>
              <span style={{ fontSize:11, color:"var(--muted)", fontWeight:600 }}>{s.sub}</span>
            </div>
            <div style={{ fontFamily:"var(--font-head)", fontSize:"1.4rem", fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
        <Card style={{ padding:20 }}>
          <div style={{ fontFamily:"var(--font-head)", fontWeight:700, marginBottom:16 }}>Spending by Category</div>
          <div style={{ display:"flex", gap:20, alignItems:"center" }}>
            {catData.length ? <PieChart data={catData} size={120} /> : <p style={{ color:"var(--muted)", fontSize:13 }}>No data yet</p>}
            <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1 }}>
              {CATEGORIES.filter(c=>expenses.some(e=>e.cat===c.id)).map(c=>{
                const amt = expenses.filter(e=>e.cat===c.id).reduce((s,e)=>s+e.amount,0);
                return (
                  <div key={c.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:99, background:c.color, flexShrink:0 }} />
                    <span style={{ fontSize:12, color:"var(--muted)", flex:1 }}>{c.label}</span>
                    <span style={{ fontSize:12, fontWeight:600 }}>{fmt(amt)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card style={{ padding:20 }}>
          <div style={{ fontFamily:"var(--font-head)", fontWeight:700, marginBottom:16 }}>This Week</div>
          <BarChart data={weekData} />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:12 }}>
            <span style={{ fontSize:12, color:"var(--muted)" }}>Total: {fmt(weekData.reduce((s,d)=>s+d.value,0))}</span>
            <Badge color="var(--accent)">↓ 12% vs last week</Badge>
          </div>
        </Card>
      </div>

      {/* Budget progress */}
      <Card style={{ padding:20 }}>
        <div style={{ fontFamily:"var(--font-head)", fontWeight:700, marginBottom:16 }}>Budget Overview</div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {CATEGORIES.slice(0,5).map(c=>{
            const spent = expenses.filter(e=>e.cat===c.id).reduce((s,e)=>s+e.amount,0);
            const budget = budgets[c.id] || 3000;
            const pct = Math.round((spent/budget)*100);
            return (
              <div key={c.id}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13 }}>{c.icon} {c.label}</span>
                  <span style={{ fontSize:12, color:pct>90?"var(--red)":"var(--muted)" }}>{fmt(spent)} / {fmt(budget)}</span>
                </div>
                <ProgressBar pct={pct} color={pct>90?"var(--red)":pct>70?"var(--yellow)":c.color} />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent expenses */}
      <Card style={{ padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontFamily:"var(--font-head)", fontWeight:700 }}>Recent Expenses</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
          {recentExp.map(e=>{
            const c = cat(e.cat);
            return (
              <div key={e.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:"1px solid var(--border)" }}>
                <div style={{ width:38, height:38, borderRadius:10, background:c.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{c.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:500, fontSize:14 }}>{e.title}</div>
                  <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{e.date} · {c.label}</div>
                </div>
                <div style={{ fontWeight:700, color:"var(--red)", fontSize:15 }}>−{fmt(e.amount)}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Savings goals mini */}
      <Card style={{ padding:20 }}>
        <div style={{ fontFamily:"var(--font-head)", fontWeight:700, marginBottom:16 }}>Savings Goals</div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {goals.map(g=>{
            const pct = Math.round((g.saved/g.target)*100);
            return (
              <div key={g.id}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13 }}>{g.icon} {g.title}</span>
                  <span style={{ fontSize:12, color:"var(--muted)" }}>{pct}%</span>
                </div>
                <ProgressBar pct={pct} color="var(--accent2)" />
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                  <span style={{ fontSize:11, color:"var(--muted)" }}>{fmt(g.saved)} saved</span>
                  <span style={{ fontSize:11, color:"var(--muted)" }}>Goal: {fmt(g.target)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// Add Expense
const AddExpense = ({ onAdd }) => {
  const [form, setForm] = useState({ title:"", amount:"", cat:"food", date:today(), note:"", recurring:false });
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount)<=0) e.amount = "Enter a valid amount";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    onAdd({ id:Date.now(), ...form, amount:Number(form.amount) });
    setForm({ title:"", amount:"", cat:"food", date:today(), note:"", recurring:false });
    setSuccess(true);
    setTimeout(()=>setSuccess(false), 2500);
  };

  const quickAmounts = [50,100,200,500,1000];

  return (
    <div style={{ padding:"24px 0", display:"flex", flexDirection:"column", gap:20, maxWidth:520 }}>
      <div>
        <h2 style={{ fontFamily:"var(--font-head)", fontSize:"1.5rem", fontWeight:800 }}>Add Expense</h2>
        <p style={{ color:"var(--muted)", fontSize:14, marginTop:4 }}>Quick, simple, done in seconds.</p>
      </div>

      {success && (
        <div style={{ background:"var(--accent)22", border:"1px solid var(--accent)44", borderRadius:"var(--radius-sm)", padding:"14px 18px", display:"flex", gap:10, alignItems:"center" }}>
          <span>✅</span>
          <span style={{ fontSize:14, color:"var(--accent)" }}>Expense logged successfully!</span>
        </div>
      )}

      <Card style={{ padding:24, display:"flex", flexDirection:"column", gap:18 }}>
        <Input label="What did you spend on?" placeholder="e.g. Coffee, Bus fare..." value={form.title}
          onChange={e=>setForm({...form,title:e.target.value})}
          style={{ borderColor:errors.title?"var(--red)":"var(--border)" }} />
        {errors.title && <p style={{ fontSize:12, color:"var(--red)", marginTop:-12 }}>{errors.title}</p>}

        <div>
          <Input label="Amount (₹)" type="number" placeholder="0" value={form.amount}
            onChange={e=>setForm({...form,amount:e.target.value})}
            style={{ borderColor:errors.amount?"var(--red)":"var(--border)" }} />
          {errors.amount && <p style={{ fontSize:12, color:"var(--red)", marginTop:4 }}>{errors.amount}</p>}
          <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
            {quickAmounts.map(a=>(
              <button key={a} onClick={()=>setForm({...form,amount:String(a)})}
                style={{ background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", borderRadius:6, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:500 }}>
                +₹{a}
              </button>
            ))}
          </div>
        </div>

        <Select label="Category" value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})}>
          {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </Select>

        <Input label="Date" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />

        <Input label="Note (optional)" placeholder="Any extra detail..." value={form.note} onChange={e=>setForm({...form,note:e.target.value})} />

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <input type="checkbox" id="rec" checked={form.recurring} onChange={e=>setForm({...form,recurring:e.target.checked})}
            style={{ width:16, height:16, accentColor:"var(--accent)" }} />
          <label htmlFor="rec" style={{ fontSize:13, color:"var(--muted)", cursor:"pointer" }}>Mark as recurring expense</label>
        </div>

        <Btn onClick={submit} style={{ width:"100%", padding:"13px", fontSize:15, borderRadius:"var(--radius-sm)" }}>
          ➕ Log Expense
        </Btn>
      </Card>

      {/* Category legend */}
      <Card style={{ padding:20 }}>
        <div style={{ fontSize:12, color:"var(--muted)", fontWeight:600, letterSpacing:.5, textTransform:"uppercase", marginBottom:12 }}>Auto-detected categories</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {CATEGORIES.map(c=>(
            <div key={c.id} onClick={()=>setForm({...form,cat:c.id})}
              style={{ display:"flex", alignItems:"center", gap:6, background:form.cat===c.id?c.color+"33":"var(--bg3)", border:`1px solid ${form.cat===c.id?c.color+"66":"var(--border)"}`, borderRadius:"var(--radius-sm)", padding:"6px 12px", cursor:"pointer", transition:"all .2s" }}>
              <span style={{ fontSize:14 }}>{c.icon}</span>
              <span style={{ fontSize:12, fontWeight:500 }}>{c.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Expenses List
const ExpenseList = ({ expenses, onDelete }) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = expenses.filter(e=>{
    const catMatch = filter==="all" || e.cat===filter;
    const searchMatch = !search || e.title.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  }).sort((a,b)=>new Date(b.date)-new Date(a.date));

  const total = filtered.reduce((s,e)=>s+e.amount,0);

  return (
    <div style={{ padding:"24px 0", display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h2 style={{ fontFamily:"var(--font-head)", fontSize:"1.5rem", fontWeight:800 }}>Expense History</h2>
        <p style={{ color:"var(--muted)", fontSize:14, marginTop:4 }}>All your transactions, at a glance.</p>
      </div>

      <Card style={{ padding:16, display:"flex", flexDirection:"column", gap:12 }}>
        <Input placeholder="🔍 Search expenses..." value={search} onChange={e=>setSearch(e.target.value)} />
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button onClick={()=>setFilter("all")} style={{ background:filter==="all"?"var(--accent)":"var(--bg3)", color:filter==="all"?"#0a1a0e":"var(--text)", border:"none", borderRadius:6, padding:"5px 14px", fontSize:12, cursor:"pointer", fontWeight:600 }}>All</button>
          {CATEGORIES.map(c=>(
            <button key={c.id} onClick={()=>setFilter(c.id)}
              style={{ background:filter===c.id?c.color+"33":"var(--bg3)", color:filter===c.id?c.color:"var(--text)", border:`1px solid ${filter===c.id?c.color+"55":"var(--border)"}`, borderRadius:6, padding:"5px 12px", fontSize:12, cursor:"pointer" }}>
              {c.icon}
            </button>
          ))}
        </div>
      </Card>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:13, color:"var(--muted)" }}>{filtered.length} transactions</span>
        <span style={{ fontWeight:700, color:"var(--red)" }}>Total: {fmt(total)}</span>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <div style={{ padding:40, textAlign:"center", color:"var(--muted)" }}>No expenses found. Try a different filter.</div>
        ) : (
          filtered.map((e,i)=>{
            const c = cat(e.cat);
            return (
              <div key={e.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 20px", borderBottom:i<filtered.length-1?"1px solid var(--border)":"none" }}>
                <div style={{ width:40, height:40, borderRadius:10, background:c.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{c.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:500, fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.title}</div>
                  <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{e.date} · {c.label}{e.recurring?" · 🔄":""}</div>
                </div>
                <div style={{ fontWeight:700, color:"var(--red)", fontSize:15, flexShrink:0 }}>−{fmt(e.amount)}</div>
                <button onClick={()=>onDelete(e.id)} style={{ background:"var(--red)22", border:"none", color:"var(--red)", borderRadius:6, padding:"4px 8px", cursor:"pointer", fontSize:12, flexShrink:0 }}>✕</button>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
};

// Budget Planner
const BudgetPlanner = ({ expenses, budgets, setBudgets }) => {
  const [editing, setEditing] = useState(null);
  const [val, setVal] = useState("");

  const save = (id) => {
    setBudgets(prev=>({...prev,[id]:Number(val)}));
    setEditing(null);
  };

  const totalBudget = Object.values(budgets).reduce((s,v)=>s+v,0);
  const totalSpent = expenses.reduce((s,e)=>s+e.amount,0);

  return (
    <div style={{ padding:"24px 0", display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h2 style={{ fontFamily:"var(--font-head)", fontSize:"1.5rem", fontWeight:800 }}>Budget Planner</h2>
        <p style={{ color:"var(--muted)", fontSize:14, marginTop:4 }}>Set limits, stay on track.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14 }}>
        {[
          { label:"Total Budget", value:fmt(totalBudget), color:"var(--accent2)" },
          { label:"Total Spent", value:fmt(totalSpent), color:"var(--red)" },
          { label:"Remaining", value:fmt(Math.max(totalBudget-totalSpent,0)), color:"var(--accent)" },
        ].map(s=>(
          <Card key={s.label} style={{ padding:20, textAlign:"center" }}>
            <div style={{ fontFamily:"var(--font-head)", fontSize:"1.3rem", fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <Card style={{ padding:4, overflow:"hidden" }}>
        {CATEGORIES.map((c,i)=>{
          const budget = budgets[c.id] || 3000;
          const spent = expenses.filter(e=>e.cat===c.id).reduce((s,e)=>s+e.amount,0);
          const pct = Math.min(Math.round((spent/budget)*100),100);
          const over = spent > budget;
          return (
            <div key={c.id} style={{ padding:"16px 20px", borderBottom:i<CATEGORIES.length-1?"1px solid var(--border)":"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                <div style={{ width:36, height:36, borderRadius:8, background:c.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{c.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>{c.label}</div>
                  {over && <Badge color="var(--red)">Over budget!</Badge>}
                </div>
                {editing===c.id ? (
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <input type="number" value={val} onChange={e=>setVal(e.target.value)}
                      style={{ width:90, background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", borderRadius:6, padding:"4px 8px", fontSize:13 }} />
                    <Btn onClick={()=>save(c.id)} style={{ padding:"4px 12px", fontSize:12 }}>Save</Btn>
                    <Btn variant="ghost" onClick={()=>setEditing(null)} style={{ padding:"4px 10px", fontSize:12 }}>✕</Btn>
                  </div>
                ) : (
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:13, color:"var(--muted)" }}>{fmt(spent)} / {fmt(budget)}</span>
                    <button onClick={()=>{ setEditing(c.id); setVal(String(budget)); }}
                      style={{ background:"var(--bg3)", border:"none", color:"var(--muted)", cursor:"pointer", borderRadius:6, padding:"4px 8px", fontSize:12 }}>✏️</button>
                  </div>
                )}
              </div>
              <ProgressBar pct={pct} color={over?"var(--red)":pct>70?"var(--yellow)":c.color} />
              <div style={{ fontSize:11, color:"var(--muted)", marginTop:4, textAlign:"right" }}>{pct}% used</div>
            </div>
          );
        })}
      </Card>

      <Card style={{ padding:20 }}>
        <div style={{ fontFamily:"var(--font-head)", fontWeight:700, marginBottom:12 }}>💡 Smart Suggestions</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {["Cut Netflix + Hotstar: Save ₹500/month", "Use public transport 3x/week: Save ₹800/month", "Meal prep on Sundays: Save ₹1,200/month"].map(s=>(
            <div key={s} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"10px 14px", background:"var(--bg3)", borderRadius:"var(--radius-sm)" }}>
              <span>🎯</span>
              <span style={{ fontSize:13, color:"var(--muted)" }}>{s}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Savings Tracker
const SavingsTracker = ({ goals, setGoals }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:"", target:"", saved:"", deadline:"", icon:"🎯" });
  const icons = ["🎯","🏖️","💻","🚗","🏠","✈️","💍","🎓","📱","🛡️"];

  const addGoal = () => {
    if (!form.title || !form.target) return;
    setGoals(prev=>[...prev,{ id:Date.now(), ...form, target:Number(form.target), saved:Number(form.saved)||0 }]);
    setForm({ title:"", target:"", saved:"", deadline:"", icon:"🎯" });
    setShowForm(false);
  };

  const addToGoal = (id, amt) => {
    setGoals(prev=>prev.map(g=>g.id===id?{...g,saved:Math.min(g.saved+amt,g.target)}:g));
  };

  return (
    <div style={{ padding:"24px 0", display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ fontFamily:"var(--font-head)", fontSize:"1.5rem", fontWeight:800 }}>Savings Goals</h2>
          <p style={{ color:"var(--muted)", fontSize:14, marginTop:4 }}>Dream it. Track it. Achieve it.</p>
        </div>
        <Btn onClick={()=>setShowForm(v=>!v)} style={{ padding:"9px 18px", fontSize:13 }}>+ New Goal</Btn>
      </div>

      {showForm && (
        <Card style={{ padding:24, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ fontFamily:"var(--font-head)", fontWeight:700 }}>Create New Goal</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {icons.map(ic=>(
              <button key={ic} onClick={()=>setForm({...form,icon:ic})}
                style={{ background:form.icon===ic?"var(--accent)22":"var(--bg3)", border:`1px solid ${form.icon===ic?"var(--accent)66":"var(--border)"}`, borderRadius:8, padding:"8px 10px", cursor:"pointer", fontSize:20 }}>{ic}</button>
            ))}
          </div>
          <Input label="Goal Name" placeholder="New Laptop" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="Target Amount (₹)" type="number" placeholder="80000" value={form.target} onChange={e=>setForm({...form,target:e.target.value})} />
            <Input label="Already Saved (₹)" type="number" placeholder="0" value={form.saved} onChange={e=>setForm({...form,saved:e.target.value})} />
          </div>
          <Input label="Target Date" type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} />
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={addGoal} style={{ flex:1 }}>Create Goal</Btn>
            <Btn variant="ghost" onClick={()=>setShowForm(false)} style={{ flex:1 }}>Cancel</Btn>
          </div>
        </Card>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16 }}>
        {goals.map(g=>{
          const pct = Math.round((g.saved/g.target)*100);
          const remaining = g.target - g.saved;
          return (
            <Card key={g.id} style={{ padding:22 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:28, marginBottom:4 }}>{g.icon}</div>
                  <div style={{ fontFamily:"var(--font-head)", fontWeight:700, fontSize:15 }}>{g.title}</div>
                  {g.deadline && <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>By {g.deadline}</div>}
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"var(--font-head)", fontWeight:800, fontSize:"1.3rem", color:"var(--accent2)" }}>{pct}%</div>
                  <Badge color="var(--accent2)">In Progress</Badge>
                </div>
              </div>
              <ProgressBar pct={pct} color="var(--accent2)" height={10} />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:12, color:"var(--muted)" }}>
                <span>{fmt(g.saved)} saved</span>
                <span>{fmt(remaining)} to go</span>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:14 }}>
                {[500,1000,2000].map(a=>(
                  <button key={a} onClick={()=>addToGoal(g.id,a)}
                    style={{ flex:1, background:"var(--accent)22", border:"1px solid var(--accent)44", color:"var(--accent)", borderRadius:6, padding:"6px 0", cursor:"pointer", fontSize:12, fontWeight:600 }}>
                    +₹{(a/1000).toFixed(a<1000?0:1)}k
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Badges */}
      <Card style={{ padding:20 }}>
        <div style={{ fontFamily:"var(--font-head)", fontWeight:700, marginBottom:16 }}>🏅 Achievements</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12 }}>
          {BADGES.map(b=>(
            <div key={b.id} style={{ padding:16, background:b.earned?"var(--accent)11":"var(--bg3)", border:`1px solid ${b.earned?"var(--accent)33":"var(--border)"}`, borderRadius:"var(--radius-sm)", textAlign:"center", opacity:b.earned?1:.5 }}>
              <div style={{ fontSize:28, marginBottom:6, filter:b.earned?"none":"grayscale(1)" }}>{b.icon}</div>
              <div style={{ fontWeight:700, fontSize:13 }}>{b.label}</div>
              <div style={{ color:"var(--muted)", fontSize:11, marginTop:4 }}>{b.desc}</div>
              {b.earned && <Badge color="var(--accent)" style={{ marginTop:6 }}>Earned!</Badge>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Analytics
const Analytics = ({ expenses }) => {
  const monthly = [4200,5100,3800,6200,5500,4900,7200,5800,6400,4100,5600,7800].map((v,i)=>({ label:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i], value:v, color:"#4ade8066" }));
  const catData = CATEGORIES.map(c=>({ ...c, value:expenses.filter(e=>e.cat===c.id).reduce((s,e)=>s+e.amount,0) })).filter(d=>d.value>0);
  const total = catData.reduce((s,d)=>s+d.value,0);

  return (
    <div style={{ padding:"24px 0", display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h2 style={{ fontFamily:"var(--font-head)", fontSize:"1.5rem", fontWeight:800 }}>Analytics & Insights</h2>
        <p style={{ color:"var(--muted)", fontSize:14, marginTop:4 }}>Understand where your money goes.</p>
      </div>

      <Card style={{ padding:20 }}>
        <div style={{ fontFamily:"var(--font-head)", fontWeight:700, marginBottom:16 }}>Monthly Spending (2025–26)</div>
        <BarChart data={monthly} />
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
        <Card style={{ padding:20 }}>
          <div style={{ fontFamily:"var(--font-head)", fontWeight:700, marginBottom:16 }}>Category Breakdown</div>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <PieChart data={catData.map(d=>({value:d.value,color:d.color}))} size={120} />
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
              {catData.map(d=>(
                <div key={d.id}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:3 }}>
                    <span>{d.icon} {d.label}</span>
                    <span style={{ color:"var(--muted)" }}>{Math.round((d.value/total)*100)}%</span>
                  </div>
                  <ProgressBar pct={(d.value/total)*100} color={d.color} height={4} />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card style={{ padding:20 }}>
          <div style={{ fontFamily:"var(--font-head)", fontWeight:700, marginBottom:16 }}>Spending Trend</div>
          <SparkLine values={[3200,4100,3800,5200,4600,5900,5500,6200,5800,4900,5600,7800]} width={260} height={80} />
          <div style={{ fontSize:12, color:"var(--muted)", marginTop:8 }}>12-month rolling average: ₹5,300/month</div>
        </Card>
      </div>

      <Card style={{ padding:20 }}>
        <div style={{ fontFamily:"var(--font-head)", fontWeight:700, marginBottom:16 }}>🤖 Smart Insights</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {TIPS.map((t,i)=>(
            <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"12px 16px", background:"var(--bg3)", borderRadius:"var(--radius-sm)", borderLeft:"3px solid var(--accent2)" }}>
              <span style={{ color:"var(--accent2)", fontSize:16 }}>✦</span>
              <span style={{ fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>{t}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Feedback
const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [form, setForm] = useState({ type:"feedback", msg:"", email:"" });
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!form.msg) return;
    setSent(true);
    setTimeout(()=>setSent(false), 3000);
    setForm({ type:"feedback", msg:"", email:"" });
    setRating(0);
  };

  return (
    <div style={{ padding:"24px 0", display:"flex", flexDirection:"column", gap:20, maxWidth:520 }}>
      <div>
        <h2 style={{ fontFamily:"var(--font-head)", fontSize:"1.5rem", fontWeight:800 }}>Feedback & Help</h2>
        <p style={{ color:"var(--muted)", fontSize:14, marginTop:4 }}>We read every message. Seriously.</p>
      </div>

      {sent && (
        <div style={{ background:"var(--accent)22", border:"1px solid var(--accent)44", borderRadius:"var(--radius-sm)", padding:"14px 18px" }}>
          <span style={{ color:"var(--accent)", fontSize:14 }}>✅ Thanks for your feedback! We'll get back to you.</span>
        </div>
      )}

      <Card style={{ padding:24, display:"flex", flexDirection:"column", gap:16 }}>
        <div>
          <div style={{ fontSize:12, color:"var(--muted)", fontWeight:600, letterSpacing:.5, textTransform:"uppercase", marginBottom:10 }}>Rate your experience</div>
          <div style={{ display:"flex", gap:8 }}>
            {[1,2,3,4,5].map(s=>(
              <button key={s} onClick={()=>setRating(s)}
                style={{ fontSize:28, background:"none", border:"none", cursor:"pointer", filter:s<=rating?"none":"grayscale(1)", transition:"filter .2s, transform .2s", transform:s<=rating?"scale(1.15)":"scale(1)" }}>
                ⭐
              </button>
            ))}
          </div>
        </div>

        <Select label="Type" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
          <option value="feedback">General Feedback</option>
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
          <option value="other">Other</option>
        </Select>

        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, letterSpacing:.5, textTransform:"uppercase" }}>Message</label>
          <textarea value={form.msg} onChange={e=>setForm({...form,msg:e.target.value})}
            placeholder="Tell us what's on your mind..."
            rows={4}
            style={{ background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", borderRadius:"var(--radius-sm)", padding:"10px 14px", fontSize:14, fontFamily:"var(--font-body)", outline:"none", resize:"vertical" }} />
        </div>

        <Input label="Email (optional)" placeholder="you@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />

        <Btn onClick={submit} style={{ width:"100%" }}>Send Feedback</Btn>
      </Card>

      <Card style={{ padding:20 }}>
        <div style={{ fontFamily:"var(--font-head)", fontWeight:700, marginBottom:16 }}>💬 FAQs</div>
        {[
          ["How do I delete an expense?", "Go to Expense History, find the transaction, and tap the ✕ button."],
          ["Can I export my data?", "Export to PDF/Excel is coming in the next update!"],
          ["Is my data stored securely?", "All data is stored locally in your browser. Nothing is sent to a server."],
          ["How do badges work?", "Complete financial milestones — streaks, budget goals, savings targets — to earn them."],
        ].map(([q,a],i)=>(
          <details key={i} style={{ borderBottom:"1px solid var(--border)", padding:"12px 0" }}>
            <summary style={{ cursor:"pointer", fontWeight:600, fontSize:14, listStyle:"none", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              {q} <span style={{ color:"var(--muted)" }}>+</span>
            </summary>
            <p style={{ fontSize:13, color:"var(--muted)", marginTop:8, lineHeight:1.6 }}>{a}</p>
          </details>
        ))}
      </Card>

      <Card style={{ padding:20 }}>
        <div style={{ fontFamily:"var(--font-head)", fontWeight:700, marginBottom:12 }}>📚 Financial Tips</div>
        {["The 50/30/20 rule: 50% needs, 30% wants, 20% savings.","Track daily — small habits build big wealth.","An emergency fund of 3–6 months expenses is your first goal."].map((t,i)=>(
          <div key={i} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:i<2?"1px solid var(--border)":"none" }}>
            <span style={{ color:"var(--accent)", flexShrink:0 }}>✦</span>
            <span style={{ fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>{t}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", icon:"🏠", label:"Dashboard" },
  { id:"add", icon:"➕", label:"Add" },
  { id:"expenses", icon:"📋", label:"History" },
  { id:"budget", icon:"🎯", label:"Budget" },
  { id:"savings", icon:"💰", label:"Savings" },
  { id:"analytics", icon:"📊", label:"Analytics" },
  { id:"feedback", icon:"💬", label:"Feedback" },
];

export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | auth | app
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState("");
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [budgets, setBudgets] = useState({ food:5000, transport:2000, shopping:3000, entertainment:1500, health:1000, education:2000, utilities:1500, other:1000 });

  const deleteExpense = (id) => setExpenses(prev=>prev.filter(e=>e.id!==id));
  const addExpense = (e) => setExpenses(prev=>[e,...prev]);
  const login = (name) => { setUser(name); setScreen("app"); };

  if (screen==="landing") return <><FontLoader /><Landing onEnter={()=>setScreen("auth")} /></>;
  if (screen==="auth") return <><FontLoader /><Auth onLogin={login} /></>;

  return (
    <>
      <FontLoader />
      <div style={{ display:"flex", minHeight:"100vh" }}>
        {/* Sidebar */}
        <aside style={{ width:220, background:"var(--bg2)", borderRight:"1px solid var(--border)", position:"fixed", top:0, left:0, height:"100vh", display:"flex", flexDirection:"column", zIndex:100 }}>
          <div style={{ padding:"24px 20px 16px" }}>
            <div style={{ fontFamily:"var(--font-head)", fontWeight:900, fontSize:"1.3rem", display:"flex", alignItems:"center", gap:8 }}>
              <span>💸</span> FinFlow
            </div>
            <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>Hey, {user}!</div>
          </div>
          <nav style={{ flex:1, padding:"8px 12px", display:"flex", flexDirection:"column", gap:4 }}>
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>setPage(n.id)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:"var(--radius-sm)", border:"none", background:page===n.id?"var(--accent)22":"transparent", color:page===n.id?"var(--accent)":"var(--muted)", cursor:"pointer", fontFamily:"var(--font-body)", fontSize:14, fontWeight:page===n.id?600:400, transition:"all .2s", textAlign:"left" }}>
                <span style={{ fontSize:16 }}>{n.icon}</span> {n.label}
              </button>
            ))}
          </nav>
          <div style={{ padding:"16px 20px", borderTop:"1px solid var(--border)" }}>
            <button onClick={()=>setScreen("landing")}
              style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:13, fontFamily:"var(--font-body)" }}>
              ← Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ marginLeft:220, flex:1, padding:"0 28px", maxWidth:"calc(100vw - 220px)" }}>
          {page==="dashboard" && <Dashboard expenses={expenses} goals={goals} budgets={budgets} user={user} />}
          {page==="add" && <AddExpense onAdd={addExpense} />}
          {page==="expenses" && <ExpenseList expenses={expenses} onDelete={deleteExpense} />}
          {page==="budget" && <BudgetPlanner expenses={expenses} budgets={budgets} setBudgets={setBudgets} />}
          {page==="savings" && <SavingsTracker goals={goals} setGoals={setGoals} />}
          {page==="analytics" && <Analytics expenses={expenses} />}
          {page==="feedback" && <Feedback />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <style>{`
        @media(max-width:640px){
          aside{display:none!important}
          main{margin-left:0!important;max-width:100vw!important;padding:0 16px 80px!important}
          .mobile-nav{display:flex!important}
        }
        .mobile-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--bg2);border-top:1px solid var(--border);z-index:200;padding:4px 0}
      `}</style>
      <div className="mobile-nav">
        {NAV.slice(0,6).map(n=>(
          <button key={n.id} onClick={()=>setPage(n.id)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"8px 4px", background:"none", border:"none", color:page===n.id?"var(--accent)":"var(--muted)", cursor:"pointer", fontSize:10, fontFamily:"var(--font-body)" }}>
            <span style={{ fontSize:18 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </div>
    </>
  );
}
