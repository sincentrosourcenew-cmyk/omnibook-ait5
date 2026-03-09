const { useState, useRef } = React;

const LANGUAGES = ["English", "Arabic", "French", "Spanish", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Russian"];
const STYLES = ["Academic", "Simple", "Professional", "Creative", "Story-like", "Technical", "Persuasive", "Journalistic"];
const TEMPLATES = ["Standard Book", "Novel", "Textbook", "Poetry Collection", "Self-Help", "Biography", "Business", "Children's Book", "Thriller", "Sci-Fi"];

const SAMPLE_BOOKS = [
  { id: 1, title: "The Art of Deep Work", pages: 312, chapters: 14, words: 87400, date: "Mar 4", style: "Professional" },
  { id: 2, title: "Marketing in the Age of AI", pages: 198, chapters: 10, words: 54200, date: "Feb 28", style: "Business" },
  { id: 3, title: "Echoes of Tomorrow", pages: 428, chapters: 22, words: 112900, date: "Feb 22", style: "Novel" },
  { id: 4, title: "Quantum Cooking", pages: 245, chapters: 18, words: 61300, date: "Feb 15", style: "Creative" },
  { id: 5, title: "A Season of Silence", pages: 88, chapters: 6, words: 21700, date: "Feb 10", style: "Poetry" },
];

async function callClaude(messages, maxTokens = 4096, system = "") {
  const apiKey = window.ANTHROPIC_API_KEY || "";
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC API key");
  }
  const body = { model: "claude-sonnet-4-20250514", max_tokens: maxTokens, messages };
  if (system) body.system = system;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Claude API error: ${res.status}`);
  }
  const data = await res.json();
  return data.content?.map((b) => b.text || "").join("") || "";
}

const Icon = ({ name, size = 18, className = "", ...rest }) => {
  const icons = {
    book: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className} {...rest}><polyline points="20 6 9 17 4 12" /></svg>,
    clock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    arrow: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
    arrowLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
    sparkle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><path d="M12 3l1.5 5h5l-4 3 1.5 5-4-3-4 3 1.5-5-4-3h5z" /></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    file: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    zap: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    layers: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...rest}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  };
  return icons[name] || null;
};

function generatePDF(book) {
  const chapters = book.chapters || [];
  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Georgia,serif;padding:40px;color:#1a1a1a}h1{font-size:38px}h2{margin-top:36px}p{line-height:1.7}</style></head><body>`;
  html += `<h1>${book.title}</h1><p><strong>By ${book.author || "The Author"}</strong></p>`;
  html += `<h2>Table of Contents</h2><ol>${chapters.map((ch) => `<li>${ch.title}</li>`).join("")}</ol>`;
  chapters.forEach((ch, i) => {
    html += `<h2>Chapter ${i + 1}: ${ch.title}</h2>`;
    html += (ch.content || "Content coming soon.").split("\n\n").filter(Boolean).map((p) => `<p>${p}</p>`).join("");
  });
  html += `</body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${book.title.replace(/\s+/g, "-")}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function OmnibookAI() {
  const [view, setView] = useState("dashboard");
  const [books, setBooks] = useState(SAMPLE_BOOKS);
  const [currentBook, setCurrentBook] = useState(null);
  const [userName, setUserName] = useState("Alex Morgan");
  const [step, setStep] = useState(1);
  const [notification, setNotification] = useState(null);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const totalPages = books.reduce((s, b) => s + b.pages, 0);

  const handleBookComplete = (book) => {
    const newBook = { ...book, id: Date.now(), date: "Just now" };
    setBooks((prev) => [newBook, ...prev]);
    setCurrentBook(newBook);
    setView("result");
    notify("Book created successfully!");
  };

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#FAFAFA", minHeight: "100vh", color: "#1F2937" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap'); .btn-primary{background:#3B82F6;color:#fff;border:none;border-radius:10px;padding:11px 22px;font-size:14px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:8px}.btn-secondary{background:#fff;color:#374151;border:1.5px solid #E5E7EB;border-radius:10px;padding:10px 20px;font-size:14px;font-weight:500;cursor:pointer}.btn-ghost{background:transparent;color:#6B7280;border:none;border-radius:8px;padding:8px 12px;font-size:14px;font-weight:500;cursor:pointer}.card{background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,0.04)}.input{width:100%;background:#fff;border:1.5px solid #E5E7EB;border-radius:10px;padding:11px 14px;font-size:14px}.chip{padding:7px 14px;border-radius:8px;font-size:13px;border:1.5px solid #E5E7EB;background:#fff;cursor:pointer}.chip.active{border-color:#3B82F6;background:#EFF6FF;color:#3B82F6}.nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;cursor:pointer;font-size:14px;color:#6B7280}.nav-item.active{background:#EFF6FF;color:#3B82F6}.progress-bar{height:8px;background:#E5E7EB;border-radius:99px;overflow:hidden}.progress-fill{height:100%;background:linear-gradient(90deg,#3B82F6,#60a5fa)}`}</style>
      {notification && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100, background: notification.type === "error" ? "#fee2e2" : "#d1fae5", padding: "10px 16px", borderRadius: 8 }}>{notification.msg}</div>}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside style={{ width: 220, background: "#fff", borderRight: "1px solid #E5E7EB", padding: "20px 12px" }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>OMNIBOOK AI</div>
          <div className={`nav-item ${view === "dashboard" ? "active" : ""}`} onClick={() => setView("dashboard")}><Icon name="layers" size={17} /> Dashboard</div>
          <div className={`nav-item ${view === "create" ? "active" : ""}`} onClick={() => { setView("create"); setStep(1); }}><Icon name="plus" size={17} /> New Book</div>
          <div className={`nav-item ${view === "settings" ? "active" : ""}`} onClick={() => setView("settings")}><Icon name="settings" size={17} /> Settings</div>
        </aside>
        <main style={{ flex: 1, padding: 32 }}>
          {view === "dashboard" && <Dashboard books={books} greeting={greeting} userName={userName} totalPages={totalPages} onNew={() => { setView("create"); setStep(1); }} onView={(b) => { setCurrentBook(b); setView("result"); }} onDelete={(id) => { setBooks((p) => p.filter((b) => b.id !== id)); notify("Book deleted."); }} />}
          {view === "create" && <CreateFlow step={step} setStep={setStep} onComplete={handleBookComplete} onCancel={() => setView("dashboard")} userName={userName} notify={notify} />}
          {view === "settings" && <Settings userName={userName} setUserName={setUserName} books={books} notify={notify} />}
          {view === "result" && currentBook && <ResultPage book={currentBook} onNew={() => { setView("create"); setStep(1); }} onBack={() => setView("dashboard")} notify={notify} />}
        </main>
      </div>
    </div>
  );
}

function Dashboard({ books, greeting, userName, totalPages, onNew, onView, onDelete }) {
  return <div><h2>{greeting}, {userName}</h2><button className="btn-primary" onClick={onNew}><Icon name="plus" size={14} />Start Writing</button><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "18px 0" }}><div className="card"><div>Total Books</div><strong>{books.length}</strong></div><div className="card"><div>Total Pages</div><strong>{totalPages}</strong></div><div className="card"><div>Avg Speed</div><strong>2.4 min</strong></div></div><div className="card"><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th align="left">Title</th><th align="left">Pages</th><th align="left">Style</th><th align="left">Date</th><th></th></tr></thead><tbody>{books.map((book) => <tr key={book.id}><td>{book.title}</td><td>{book.pages}</td><td>{book.style}</td><td>{book.date}</td><td><button className="btn-ghost" onClick={() => onView(book)}>View</button><button className="btn-ghost" onClick={() => onDelete(book.id)}>Delete</button></td></tr>)}</tbody></table></div></div>;
}

function CreateFlow({ step, setStep, onComplete, onCancel, userName, notify }) {
  const [form, setForm] = useState({ title: "", language: "English", pages: 250, chapters: 12, style: "Professional", template: "Standard Book" });
  const [idea, setIdea] = useState("");
  const [genState, setGenState] = useState({ progress: 0, currentChapter: 0, total: 0, log: [], done: false, chapters: [] });
  const [cover, setCover] = useState(null);
  const cancelRef = useRef(false);

  const startGeneration = async () => {
    cancelRef.current = false;
    setStep(3);
    const chapters = [];
    const total = Math.min(form.chapters, 8);
    setGenState({ progress: 0, currentChapter: 0, total, log: [], done: false, chapters: [] });
    try {
      const outlinePrompt = `Create a detailed outline for a ${form.style.toLowerCase()} book titled "${form.title}" with exactly ${total} chapters. Book idea: ${idea}. Return JSON array with title and summary.`;
      let outline = [];
      try {
        const outlineRaw = await callClaude([{ role: "user", content: outlinePrompt }], 2000, "Return JSON only");
        outline = JSON.parse(outlineRaw.replace(/```json|```/g, "").trim());
      } catch {
        outline = Array.from({ length: total }, (_, i) => ({ title: `Chapter ${i + 1}`, summary: "" }));
      }
      const bg = ["#1a1a2e", "#0f3460", "#16213e"][Math.floor(Math.random() * 3)];
      const accent = ["#e94560", "#3B82F6", "#f59e0b"][Math.floor(Math.random() * 3)];
      const newCover = { bg, accent, title: form.title, author: userName };
      setCover(newCover);
      for (let i = 0; i < total; i++) {
        if (cancelRef.current) break;
        const ch = outline[i] || { title: `Chapter ${i + 1}`, summary: "" };
        setGenState((p) => ({ ...p, currentChapter: i + 1, progress: Math.round((i / total) * 100), log: [...p.log, { text: `Writing Chapter ${i + 1}: ${ch.title}`, status: "working" }] }));
        let content = "";
        try {
          const prompt = `Write chapter ${i + 1} titled ${ch.title}. Context: ${ch.summary || idea}`;
          content = await callClaude([{ role: "user", content: prompt }], 2500, "Write rich content");
        } catch {
          content = `${ch.title}\n\n${ch.summary || "Detailed chapter content."}`;
        }
        chapters.push({ title: ch.title, content, words: content.trim().split(/\s+/).length });
        setGenState((p) => ({ ...p, progress: Math.round(((i + 1) / total) * 100), chapters: [...chapters], log: p.log.map((l, idx) => idx === p.log.length - 1 ? { ...l, status: "done" } : l) }));
        if (i < total - 1) await new Promise((r) => setTimeout(r, 800));
      }
      setGenState((p) => ({ ...p, progress: 100, done: true }));
      const totalWords = chapters.reduce((s, c) => s + c.words, 0);
      setTimeout(() => onComplete({ title: form.title, author: userName, pages: form.pages, words: totalWords, chapters, style: form.style, language: form.language, template: form.template, cover: newCover }), 800);
    } catch {
      notify("Error during generation. Please try again.", "error");
      setStep(2);
    }
  };

  if (step === 1) return <div className="card" style={{ maxWidth: 740 }}><h2>Book Details</h2><FormRow label="Title"><input className="input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></FormRow><FormRow label="Language"><div>{LANGUAGES.map((l) => <button key={l} className={`chip ${form.language === l ? "active" : ""}`} onClick={() => setForm((p) => ({ ...p, language: l }))}>{l}</button>)}</div></FormRow><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}><FormRow label="Pages"><input className="input" type="number" value={form.pages} onChange={(e) => setForm((p) => ({ ...p, pages: Number(e.target.value) }))} /></FormRow><FormRow label="Chapters"><input className="input" type="number" value={form.chapters} onChange={(e) => setForm((p) => ({ ...p, chapters: Number(e.target.value) }))} /></FormRow></div><FormRow label="Style"><div>{STYLES.map((s) => <button key={s} className={`chip ${form.style === s ? "active" : ""}`} onClick={() => setForm((p) => ({ ...p, style: s }))}>{s}</button>)}</div></FormRow><FormRow label="Template" last><div>{TEMPLATES.map((t) => <button key={t} className={`chip ${form.template === t ? "active" : ""}`} onClick={() => setForm((p) => ({ ...p, template: t }))}>{t}</button>)}</div></FormRow><button className="btn-secondary" onClick={onCancel}>Cancel</button> <button className="btn-primary" onClick={() => setStep(2)} disabled={!form.title.trim()}>Next</button></div>;
  if (step === 2) return <div className="card" style={{ maxWidth: 740 }}><h2>Describe Your Idea</h2><textarea className="input" rows={10} value={idea} onChange={(e) => setIdea(e.target.value)} /><div style={{ marginTop: 12 }}><button className="btn-secondary" onClick={() => setStep(1)}>Back</button> <button className="btn-primary" onClick={startGeneration} disabled={idea.trim().length < 20}>Generate My Book</button></div></div>;
  if (step === 3) return <div className="card" style={{ maxWidth: 740 }}><h2>Writing Your Book…</h2><div className="progress-bar"><div className="progress-fill" style={{ width: `${genState.progress}%` }} /></div><p>{genState.progress}%</p><ul>{genState.log.map((l, i) => <li key={i}>{l.status === "done" ? "✅" : "⏳"} {l.text}</li>)}</ul>{!genState.done && <button className="btn-secondary" onClick={() => { cancelRef.current = true; setStep(1); }}>Cancel</button>}</div>;
  return null;
}

function ResultPage({ book, onNew, onBack, notify }) {
  const [activeChapter, setActiveChapter] = useState(null);
  const totalWords = book.words || 0;
  return <div><h2>{book.title}</h2><p>By {book.author}</p><button className="btn-secondary" onClick={onBack}>Library</button> <button className="btn-primary" onClick={onNew}>New Book</button><div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginTop: 16 }}><div className="card"><h3>Table of Contents</h3>{(book.chapters || []).map((ch, i) => <div key={i} onClick={() => setActiveChapter(activeChapter === i ? null : i)} style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0", cursor: "pointer" }}><strong>{i + 1}. {ch.title}</strong>{activeChapter === i && <p style={{ whiteSpace: "pre-wrap" }}>{(ch.content || "").slice(0, 900)}</p>}</div>)}</div><div><div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", aspectRatio: "2/3" }}><BookCover book={book} /></div><div className="card" style={{ marginTop: 12 }}><div>Pages: {book.pages}</div><div>Chapters: {book.chapters?.length || 0}</div><div>Words: {totalWords.toLocaleString()}</div><button className="btn-primary" style={{ marginTop: 10 }} onClick={() => { generatePDF(book); notify("Downloaded HTML file"); }}><Icon name="download" size={14} /> Download HTML/PDF</button></div></div></div></div>;
}

function BookCover({ book }) {
  const cover = book.cover || {};
  const bg = cover.bg || "#1a1a2e";
  const accent = cover.accent || "#3B82F6";
  return <div style={{ width: "100%", height: "100%", minHeight: 320, background: `linear-gradient(145deg, ${bg} 0%, ${accent}66 100%)`, color: "#fff", padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}><div>OMNIBOOK PRESS</div><div><h3 style={{ margin: 0 }}>{book.title}</h3><p>{book.style}</p></div><div>By {book.author}</div></div>;
}

function Settings({ userName, setUserName, books, notify }) {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState("alex.morgan@example.com");
  return <div className="card" style={{ maxWidth: 640 }}><h2>Settings</h2><FormRow label="Full Name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></FormRow><FormRow label="Email" last><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></FormRow><button className="btn-primary" onClick={() => { setUserName(name); notify("Profile saved!"); }}>Save</button><p style={{ marginTop: 12 }}>Total books: {books.length}</p></div>;
}

function FormRow({ label, children, last }) { return <div style={{ marginBottom: last ? 0 : 16 }}><label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>{label}</label>{children}</div>; }

ReactDOM.createRoot(document.getElementById("root")).render(<OmnibookAI />);
