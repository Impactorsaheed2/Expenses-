import { useEffect, useState } from "react";
import { supabase } from "./supabase.js";

const blank = () => ({
  description: "",
  amount: "",
  category: "Other",
  property_name: "",
  expense_date: new Date().toISOString().slice(0, 10),
  payment_method: "Bank transfer",
  payment_status: "paid",
  notes: "",
});

const ngn = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

export default function App() {
  const [session, setSession] = useState(null),
    [loading, setLoading] = useState(true),
    [mode, setMode] = useState("signin");
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState("");
  const [expenses, setExpenses] = useState([]),
    [form, setForm] = useState(blank()),
    [editId, setEditId] = useState(null),
    [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const { data } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
    });

    return () => data?.unsubscribe?.();
  }, []);

  useEffect(() => {
    if (session?.user) load();
    else setExpenses([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  async function load() {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .is("voided_at", null)
      .order("expense_date", { ascending: false });
    if (error) setMessage(error.message);
    else setExpenses(data || []);
  }

  async function auth(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const r =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    if (r.error) {
      setMessage(r.error.message);
      setBusy(false);
      return;
    }
    setBusy(false);
  }

  async function save(e) {
    e.preventDefault();
    if (!form.description.trim() || Number(form.amount) <= 0) {
      setMessage("Enter a description and amount greater than zero.");
      return;
    }
    setBusy(true);
    const p = { ...form, amount: Number(form.amount) };

    let r;
    if (editId) {
      r = await supabase.from("expenses").update(p).eq("id", editId);
    } else {
      r = await supabase.from("expenses").insert(p);
    }

    if (r.error) setMessage(r.error.message);
    else {
      setForm(blank());
      setEditId(null);
      load();
    }
    setBusy(false);
  }

  function voice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setMessage(
        "Voice recognition is not supported in this browser. Enter details manually."
      );
      return;
    }
    const r = new SR();
    r.lang = "en-US";
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      const m = t.match(
        /(?<amount>\d+(?:\.\d+)?)\s*(?<currency>naira|ngn|dollars)?\s*(for)?\s*(?<desc>.+)/i
      );
      if (m && m.groups) {
        setForm((s) => ({ ...s, description: m.groups.desc, amount: m.groups.amount }));
      } else {
        setForm((s) => ({ ...s, description: t }));
      }
    };
    r.start();
  }

  async function voidItem(x) {
    const reason = prompt("Reason for voiding this expense?");
    if (reason === null) return;
    if (!reason.trim()) {
      setMessage("Please provide a reason.");
      return;
    }
    const { error } = await supabase
      .from("expenses")
      .update({ voided_at: new Date().toISOString(), void_reason: reason })
      .eq("id", x.id);
    if (error) setMessage(error.message);
    else load();
  }

  if (!supabase)
    return (
      <main className="center">
        <section className="card">
          <div className="logo">VE</div>
          <p className="eyebrow">REAL ESTATE EXPENSE TRACKER</p>
          <h1>VoiceExpenses</h1>
          <p>
            Supabase is not configured. Please set VITE_SUPABASE_URL and
            VITE_SUPABASE_ANON_KEY in your environment.
          </p>
        </section>
      </main>
    );

  if (loading) return <main className="center">Loading VoiceExpenses…</main>;

  if (!session)
    return (
      <main className="center">
        <section className="card">
          <div className="logo">VE</div>
          <p className="eyebrow">REAL ESTATE EXPENSE TRACKER</p>
          <h1>VoiceExpenses</h1>
          <p className="muted">Sign in or sign up to continue.</p>
          <form onSubmit={auth}>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="muted">
              <label>
                <input
                  type="radio"
                  checked={mode === "signin"}
                  onChange={() => setMode("signin")}
                />
                Sign in
              </label>{" "}
              <label>
                <input
                  type="radio"
                  checked={mode === "signup"}
                  onChange={() => setMode("signup")}
                />
                Sign up
              </label>
            </div>
            <p className="message">{message}</p>
            <button disabled={busy}>{mode === "signin" ? "Sign in" : "Sign up"}</button>
          </form>
        </section>
      </main>
    );

  const total = expenses.reduce((s, x) => s + Number(x.amount || 0), 0),
    month = expenses
      .filter((x) => x.expense_date?.slice(0, 7) === new Date().toISOString().slice(0, 7))
      .reduce((s, x) => s + Number(x.amount || 0), 0);

  return (
    <main className="shell">
      <header>
        <div className="brand">
          <div className="logo small">VE</div>
          <div>
            <b>VoiceExpenses</b>
            <small>Real Estate Expense Tracker</small>
          </div>
        </div>
        <button className="muted" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </header>

      <section className="grid">
        <section className="card">
          <h2>Overview</h2>
          <div className="numbers">
            <div>
              <div className="label">Total</div>
              <div className="value">{ngn(total)}</div>
            </div>
            <div>
              <div className="label">This month</div>
              <div className="value">{ngn(month)}</div>
            </div>
          </div>

          <h3>Add Expense</h3>
          <form onSubmit={save}>
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            />
            <input
              placeholder="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
            />
            <select
              value={form.category}
              onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
            >
              <option>Other</option>
              <option>Maintenance</option>
              <option>Utilities</option>
              <option>Rent</option>
            </select>
            <input
              placeholder="Property name"
              value={form.property_name}
              onChange={(e) => setForm((s) => ({ ...s, property_name: e.target.value }))}
            />
            <input
              type="date"
              value={form.expense_date}
              onChange={(e) => setForm((s) => ({ ...s, expense_date: e.target.value }))}
            />
            <select
              value={form.payment_method}
              onChange={(e) => setForm((s) => ({ ...s, payment_method: e.target.value }))}
            >
              <option>Bank transfer</option>
              <option>Cash</option>
              <option>POS</option>
            </select>
            <select
              value={form.payment_status}
              onChange={(e) => setForm((s) => ({ ...s, payment_status: e.target.value }))}
            >
              <option>paid</option>
              <option>pending</option>
            </select>
            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
            />
            <div className="actions">
              <button disabled={busy}>{editId ? "Save" : "Add"}</button>
              <button
                type="button"
                onClick={() => {
                  setForm(blank());
                  setEditId(null);
                }}
              >
                Clear
              </button>
              <button type="button" onClick={voice}>
                Voice
              </button>
            </div>
            <p className="message">{message}</p>
          </form>
        </section>

        <section className="card">
          <h2>Expenses</h2>
          <ul className="list">
            {expenses.map((x) => (
              <li key={x.id}>
                <div className="row">
                  <div>
                    <b>{x.description}</b>
                    <div className="muted">
                      {x.property_name} • {x.expense_date}
                    </div>
                  </div>
                  <div className="amount">{ngn(x.amount)}</div>
                </div>
                <div className="actions">
                  <button
                    onClick={() => {
                      setEditId(x.id);
                      setForm({ ...x });
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => voidItem(x)}>Void</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}
