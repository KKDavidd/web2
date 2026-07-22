import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAafCFyainmMmbaVt4Vl_EHnjgRpFJgfU0",
    authDomain: "crazyportfoliom.firebaseapp.com",
    projectId: "crazyportfoliom",
    storageBucket: "crazyportfoliom.firebasestorage.app",
    messagingSenderId: "679897293455",
    appId: "1:679897293455:web:6b445c414e297bd45006fa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* ─── Global styles injected once ───
   Ugyanaz a design-rendszer, mint a főoldalon (style.css):
   Fraunces / Inter / JetBrains Mono, azonos színpaletta és radius. */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

  :root {
    --bg-dark: #2a211c;
    --bg-medium: #4a3b32;
    --bg-light: #8e7865;
    --accent: #d4c3a3;
    --text-light: #f5f0e6;
    --text-dark: #1a1411;
    --shadow: 0 10px 30px rgba(0,0,0,0.2);
    --font-display: 'Fraunces', serif;
    --font-body: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --line: rgba(212, 195, 163, 0.16);
    --radius: 4px;

    font-family: var(--font-body);
    color: var(--text-light);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg-medium); }

  ::-webkit-scrollbar { width: 12px; }
  ::-webkit-scrollbar-track { background: var(--bg-dark); }
  ::-webkit-scrollbar-thumb {
    background: var(--accent);
    border-radius: 6px;
    border: 3px solid var(--bg-dark);
  }

  /* ── login page ── */
  .login-bg {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background:
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(212,195,163,0.045) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(212,195,163,0.045) 40px),
      linear-gradient(160deg, var(--bg-dark) 0%, var(--bg-medium) 100%);
  }

  .login-card {
    background-color: var(--bg-dark);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 52px 44px 44px;
    width: 100%;
    max-width: 400px;
    text-align: center;
    box-shadow: var(--shadow);
  }

  .login-monogram {
    width: 60px; height: 60px;
    border-radius: 50%;
    background: var(--accent);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 22px;
    font-family: var(--font-mono);
    font-size: 20px; font-weight: 600; color: var(--text-dark);
    letter-spacing: 0.5px;
  }

  .login-title {
    font-family: var(--font-display);
    color: var(--text-light);
    font-size: 1.7rem;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .login-sub {
    font-family: var(--font-mono);
    color: var(--accent);
    font-size: 0.78rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 34px;
  }

  .login-divider {
    width: 40px; height: 1px;
    background: var(--line);
    margin: 0 auto 32px;
  }

  .login-field {
    position: relative;
    margin-bottom: 14px;
    text-align: left;
  }

  .login-field label {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--bg-light);
    margin-bottom: 8px;
    font-weight: 600;
  }

  .login-field input {
    width: 100%;
    background-color: rgba(245,240,230,0.03);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 13px 16px;
    color: var(--text-light);
    font-family: var(--font-body);
    font-size: 0.92rem;
    outline: none;
    transition: border-color 0.3s, background 0.3s;
  }

  .login-field input:focus {
    border-color: var(--accent);
    background: rgba(245,240,230,0.06);
  }

  .login-btn {
    width: 100%;
    margin-top: 10px;
    padding: 16px;
    background-color: var(--accent);
    color: var(--text-dark);
    border: none;
    border-radius: var(--radius);
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .login-btn:hover { background-color: var(--text-light); transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.25); }
  .login-btn:active { transform: translateY(0); }
  .login-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

  .login-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(200,90,70,0.1);
    border: 1px solid rgba(200,90,70,0.3);
    border-radius: var(--radius);
    color: #d99080;
    font-size: 0.82rem;
    padding: 10px 14px;
    margin-top: 6px;
    text-align: left;
  }

  /* ── Dashboard ── */
  .dash { min-height: 100vh; display: flex; flex-direction: column; background-color: var(--bg-medium); }

  .dash-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 40px;
    background-color: rgba(42, 33, 28, 0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--line);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .dash-header-left { display: flex; align-items: center; gap: 14px; }

  .dash-logo-dot {
    font-family: var(--font-mono);
    font-size: 1.15rem;
    font-weight: 500;
    letter-spacing: 0.5px;
    color: var(--text-light);
  }
  .dash-logo-dot span { color: var(--accent); }

  .dash-header-sep { color: var(--line); font-size: 16px; }
  .dash-header-sub {
    font-family: var(--font-mono);
    color: var(--bg-light);
    font-size: 0.78rem;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .dash-header-right { display: flex; align-items: center; gap: 16px; }

  .dash-user-pill {
    display: flex; align-items: center; gap: 8px;
    background: rgba(212,195,163,0.06);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 6px 14px 6px 6px;
  }

  .dash-user-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono);
    font-size: 11px; font-weight: 600; color: var(--text-dark);
    flex-shrink: 0;
  }

  .dash-user-email { color: var(--bg-light); font-size: 0.78rem; }

  .dash-logout-btn {
    font-family: var(--font-mono);
    background: transparent;
    border: 1px solid var(--accent);
    color: var(--accent);
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.75rem;
    letter-spacing: 1px;
    transition: 0.3s ease;
  }
  .dash-logout-btn:hover { background: var(--accent); color: var(--bg-dark); }

  /* ── Main content ── */
  .dash-main { flex: 1; max-width: 900px; width: 100%; margin: 0 auto; padding: 50px 24px 80px; }

  /* ── Stats ── */
  .stats-row { display: flex; gap: 16px; margin-bottom: 50px; }

  .stat-card {
    flex: 1;
    background-color: var(--bg-dark);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 26px 28px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: var(--shadow);
  }

  .stat-icon {
    width: 46px; height: 46px; border-radius: var(--radius);
    background: rgba(212,195,163,0.08);
    border: 1px solid var(--line);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; color: var(--accent);
    flex-shrink: 0;
  }

  .stat-info { display: flex; flex-direction: column; }
  .stat-num { font-family: var(--font-display); color: var(--accent); font-size: 1.9rem; font-weight: 600; line-height: 1; }
  .stat-label { font-family: var(--font-mono); color: var(--bg-light); font-size: 0.7rem; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 6px; }

  /* ── Section header ── */
  .section-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--line);
  }

  .section-title-wrap { display: flex; align-items: center; gap: 12px; }
  .section-title-dot { width: 4px; height: 18px; border-radius: 2px; background: var(--accent); }
  .section-title {
    font-family: var(--font-mono);
    color: var(--accent);
    font-size: 0.78rem; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
  }

  .refresh-btn {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--font-mono);
    background: transparent;
    border: 1px solid var(--accent);
    color: var(--accent);
    border-radius: 20px;
    padding: 8px 16px;
    font-size: 0.72rem; font-weight: 600; letter-spacing: 0.5px;
    cursor: pointer;
    transition: 0.3s ease;
  }
  .refresh-btn:hover { background: var(--accent); color: var(--bg-dark); }

  /* ── Empty state ── */
  .empty-state {
    text-align: center;
    padding: 90px 20px;
    color: var(--bg-light);
    background-color: var(--bg-dark);
    border: 1px solid var(--line);
    border-radius: 10px;
  }
  .empty-icon { font-size: 2.4rem; margin-bottom: 18px; color: var(--accent); opacity: 0.6; }
  .empty-title { font-family: var(--font-display); font-size: 1.2rem; font-weight: 600; color: var(--text-light); margin-bottom: 8px; }
  .empty-sub { font-size: 0.85rem; color: var(--bg-light); }

  /* ── Message cards ── */
  .msg-list { display: flex; flex-direction: column; gap: 10px; }

  .msg-card {
    background-color: var(--bg-dark);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .msg-card:hover { border-color: rgba(212,195,163,0.3); box-shadow: var(--shadow); }
  .msg-card.expanded { border-color: rgba(212,195,163,0.35); }

  .msg-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    cursor: pointer;
    gap: 12px;
  }

  .msg-card-left { display: flex; align-items: center; gap: 14px; min-width: 0; }

  .msg-avatar {
    width: 38px; height: 38px; border-radius: var(--radius);
    background: rgba(212,195,163,0.08);
    border: 1px solid var(--line);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono);
    font-size: 13px; font-weight: 600; color: var(--accent);
    flex-shrink: 0;
  }

  .msg-name { font-family: var(--font-display); color: var(--text-light); font-weight: 600; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .msg-email { color: var(--bg-light); font-size: 0.78rem; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .msg-card-right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
  .msg-date { font-family: var(--font-mono); color: var(--bg-light); font-size: 0.72rem; white-space: nowrap; }
  .msg-chevron { color: var(--accent); font-size: 0.7rem; transition: transform 0.3s; }
  .msg-chevron.open { transform: rotate(180deg); }

  .msg-card-body {
    border-top: 1px solid var(--line);
    padding: 22px;
    background: rgba(0,0,0,0.12);
  }

  .msg-label {
    font-family: var(--font-mono);
    font-size: 0.68rem; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--bg-light); font-weight: 600; margin-bottom: 12px;
  }

  .msg-text {
    color: var(--text-light);
    font-size: 0.92rem;
    line-height: 1.75;
    white-space: pre-wrap;
    background: rgba(212,195,163,0.04);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 20px;
  }

  .msg-actions { display: flex; gap: 10px; }

  .reply-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background-color: var(--accent);
    color: var(--text-dark);
    border: none;
    border-radius: var(--radius);
    padding: 12px 20px;
    text-decoration: none;
    font-size: 0.78rem; font-weight: 700;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
  }
  .reply-btn:hover { background-color: var(--text-light); transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.25); }

  .delete-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent;
    border: 1px solid rgba(200,90,70,0.4);
    color: #d99080;
    border-radius: var(--radius);
    padding: 12px 18px;
    font-family: var(--font-body);
    font-size: 0.78rem; font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .delete-btn:hover { background: rgba(200,90,70,0.12); border-color: rgba(200,90,70,0.6); }
  .delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Loading ── */
  .loading-state {
    text-align: center; padding: 70px;
    font-family: var(--font-mono);
    color: var(--bg-light); font-size: 0.82rem; letter-spacing: 1px;
  }

  @media (max-width: 640px) {
    .dash-header { padding: 15px 20px; }
    .dash-header-sub { display: none; }
    .dash-user-email { display: none; }
    .stats-row { flex-direction: column; }
  }
`;

function injectStyles() {
    if (document.getElementById("admin-styles")) return;
    const el = document.createElement("style");
    el.id = "admin-styles";
    el.textContent = globalCSS;
    document.head.appendChild(el);
}

/* ─── Login Page ─── */
function LoginPage({ onLogin, error }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    injectStyles();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        await onLogin(email, password);
        setLoading(false);
    }

    return (
        <div className="login-bg">
            <div className="login-card">
                <div className="login-monogram">KD</div>
                <div className="login-title">K. Dávid</div>
                <div className="login-sub">Admin Panel</div>
                <div className="login-divider" />
                <form onSubmit={handleSubmit}>
                    <div className="login-field">
                        <label>E-mail cím</label>
                        <input
                            type="email"
                            placeholder="pelda@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="login-field">
                        <label>Jelszó</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="login-error"><i className="fa-solid fa-triangle-exclamation"></i> {error}</div>}
                    <button type="submit" className="login-btn" disabled={loading} style={{marginTop: 20}}>
                        {loading ? "Belépés..." : "Belépés"}
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ─── Message Card ─── */
function MessageCard({ msg, onDelete }) {
    const [deleting, setDeleting] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const date = msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp);
    const dateStr = isNaN(date) ? "–" : date.toLocaleString("hu-HU", { year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
    const initials = (msg.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    async function handleDelete() {
        if (!confirm("Biztosan törlöd ezt az üzenetet?")) return;
        setDeleting(true);
        await onDelete(msg.id);
    }

    return (
        <div className={`msg-card ${expanded ? "expanded" : ""}`}>
            <div className="msg-card-header" onClick={() => setExpanded(e => !e)}>
                <div className="msg-card-left">
                    <div className="msg-avatar">{initials}</div>
                    <div style={{minWidth:0}}>
                        <div className="msg-name">{msg.name}</div>
                        <div className="msg-email">{msg.email}</div>
                    </div>
                </div>
                <div className="msg-card-right">
                    <span className="msg-date">{dateStr}</span>
                    <i className={`fa-solid fa-chevron-down msg-chevron ${expanded ? "open" : ""}`}></i>
                </div>
            </div>
            {expanded && (
                <div className="msg-card-body">
                    <div className="msg-label">Üzenet</div>
                    <div className="msg-text">{msg.message}</div>
                    <div className="msg-actions">
                        <a href={`mailto:${msg.email}?subject=Re: Megkeresés`} className="reply-btn">
                            <i className="fa-solid fa-reply"></i> Válasz küldése
                        </a>
                        <button className="delete-btn" onClick={handleDelete} disabled={deleting}>
                            <i className="fa-solid fa-trash"></i> {deleting ? "Törlés..." : "Törlés"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Dashboard ─── */
function Dashboard({ user, onLogout }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchMessages() {
        setLoading(true);
        try {
            const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
            const snap = await getDocs(q);
            setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch(e) { console.error(e); }
        setLoading(false);
    }

    useEffect(() => { fetchMessages(); }, []);

    async function handleDelete(id) {
        await deleteDoc(doc(db, "messages", id));
        setMessages(msgs => msgs.filter(m => m.id !== id));
    }

    const emailInitial = (user.email || "A")[0].toUpperCase();

    return (
        <div className="dash">
            <header className="dash-header">
                <div className="dash-header-left">
                    <div className="dash-logo-dot">&lt;K.Dávid<span>/</span>&gt;</div>
                    <span className="dash-header-sep">|</span>
                    <span className="dash-header-sub">Admin Panel</span>
                </div>
                <div className="dash-header-right">
                    <div className="dash-user-pill">
                        <div className="dash-user-avatar">{emailInitial}</div>
                        <span className="dash-user-email">{user.email}</span>
                    </div>
                    <button className="dash-logout-btn" onClick={onLogout}>Kilépés</button>
                </div>
            </header>

            <main className="dash-main">
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-icon"><i className="fa-solid fa-envelope"></i></div>
                        <div className="stat-info">
                            <span className="stat-num">{loading ? "–" : messages.length}</span>
                            <span className="stat-label">Összes üzenet</span>
                        </div>
                    </div>
                </div>

                <div className="section-bar">
                    <div className="section-title-wrap">
                        <div className="section-title-dot" />
                        <span className="section-title">Beérkező üzenetek</span>
                    </div>
                    <button className="refresh-btn" onClick={fetchMessages}>
                        <i className="fa-solid fa-rotate"></i> Frissítés
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">Betöltés...</div>
                ) : messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><i className="fa-solid fa-inbox"></i></div>
                        <div className="empty-title">Nincs üzenet</div>
                        <div className="empty-sub">Ha valaki küld egy ajánlatkérést, itt fog megjelenni.</div>
                    </div>
                ) : (
                    <div className="msg-list">
                        {messages.map(msg => (
                            <MessageCard key={msg.id} msg={msg} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

/* ─── App root ─── */
function App() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loginError, setLoginError] = useState("");

    injectStyles();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, u => {
            setUser(u);
            setAuthLoading(false);
        });
        return unsub;
    }, []);

    async function handleLogin(email, password) {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setLoginError("");
        } catch {
            setLoginError("Hibás e-mail cím vagy jelszó.");
        }
    }

    if (authLoading) return (
        <div className="login-bg">
            <div style={{fontFamily:"'JetBrains Mono', monospace", color:"#8e7865", letterSpacing:2, fontSize:13}}>BETÖLTÉS...</div>
        </div>
    );
    if (!user) return <LoginPage onLogin={handleLogin} error={loginError} />;
    return <Dashboard user={user} onLogout={() => signOut(auth)} />;
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
