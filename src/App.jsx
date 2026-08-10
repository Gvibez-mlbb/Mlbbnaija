import React, { useState, useEffect, useCallback } from "react";
import { User, Users, Trophy, Swords, Newspaper, Plus, X, LogOut, Shield, Calendar, Award, ChevronRight } from "lucide-react";
import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const ROLE_COLORS = {
  Tank: "#4C8BF5",
  Fighter: "#FF6B4A",
  Assassin: "#B678FF",
  Mage: "#00D9C0",
  Marksman: "#FFB800",
  Support: "#00A651",
};

const TIER_COLORS = {
  S: "#FFB800",
  A: "#00D9C0",
  B: "#4C8BF5",
  C: "#8B94A3",
  D: "#FF6B4A",
};

// Full current roster, role(s) and tier as of patch 2.1.90 (Aug 2026)
const HERO_META = [
  { name: "Aamon", roles: ["Assassin"], tier: "B" },
  { name: "Akai", roles: ["Tank"], tier: "B" },
  { name: "Aldous", roles: ["Fighter"], tier: "C" },
  { name: "Alice", roles: ["Tank", "Mage"], tier: "B" },
  { name: "Alpha", roles: ["Fighter"], tier: "C" },
  { name: "Alucard", roles: ["Fighter", "Assassin"], tier: "B" },
  { name: "Angela", roles: ["Support"], tier: "B" },
  { name: "Argus", roles: ["Fighter"], tier: "A" },
  { name: "Arlott", roles: ["Fighter", "Assassin"], tier: "C" },
  { name: "Atlas", roles: ["Tank"], tier: "S" },
  { name: "Aulus", roles: ["Fighter"], tier: "B" },
  { name: "Aurora", roles: ["Mage"], tier: "C" },
  { name: "Badang", roles: ["Fighter"], tier: "B" },
  { name: "Balmond", roles: ["Fighter"], tier: "C" },
  { name: "Bane", roles: ["Fighter", "Mage"], tier: "B" },
  { name: "Barats", roles: ["Tank", "Fighter"], tier: "A" },
  { name: "Baxia", roles: ["Tank"], tier: "D" },
  { name: "Beatrix", roles: ["Marksman"], tier: "B" },
  { name: "Belerick", roles: ["Tank"], tier: "S" },
  { name: "Benedetta", roles: ["Assassin", "Fighter"], tier: "A" },
  { name: "Brody", roles: ["Marksman"], tier: "B" },
  { name: "Bruno", roles: ["Marksman"], tier: "C" },
  { name: "Carmilla", roles: ["Support", "Tank"], tier: "A" },
  { name: "Cecilion", roles: ["Mage"], tier: "B" },
  { name: "Chang'e", roles: ["Mage"], tier: "C" },
  { name: "Chip", roles: ["Support", "Tank"], tier: "C" },
  { name: "Chou", roles: ["Fighter"], tier: "C" },
  { name: "Cici", roles: ["Fighter"], tier: "C" },
  { name: "Claude", roles: ["Marksman"], tier: "C" },
  { name: "Clint", roles: ["Marksman"], tier: "B" },
  { name: "Cyclops", roles: ["Mage"], tier: "B" },
  { name: "Diggie", roles: ["Support"], tier: "A" },
  { name: "Dyrroth", roles: ["Fighter"], tier: "B" },
  { name: "Edith", roles: ["Tank", "Marksman"], tier: "B" },
  { name: "Esmeralda", roles: ["Tank", "Mage"], tier: "B" },
  { name: "Estes", roles: ["Support"], tier: "A" },
  { name: "Eudora", roles: ["Mage"], tier: "A" },
  { name: "Fanny", roles: ["Assassin"], tier: "D" },
  { name: "Faramis", roles: ["Support", "Mage"], tier: "B" },
  { name: "Floryn", roles: ["Support"], tier: "S" },
  { name: "Franco", roles: ["Tank"], tier: "D" },
  { name: "Fredrinn", roles: ["Fighter", "Tank"], tier: "A" },
  { name: "Freya", roles: ["Fighter"], tier: "C" },
  { name: "Gatotkaca", roles: ["Tank", "Fighter"], tier: "D" },
  { name: "Gloo", roles: ["Tank"], tier: "S" },
  { name: "Gord", roles: ["Mage"], tier: "S" },
  { name: "Granger", roles: ["Marksman"], tier: "D" },
  { name: "Grock", roles: ["Tank", "Fighter"], tier: "C" },
  { name: "Guinevere", roles: ["Fighter"], tier: "A" },
  { name: "Gusion", roles: ["Assassin"], tier: "B" },
  { name: "Hanabi", roles: ["Marksman"], tier: "S" },
  { name: "Hanzo", roles: ["Assassin"], tier: "A" },
  { name: "Harith", roles: ["Mage"], tier: "D" },
  { name: "Harley", roles: ["Assassin", "Mage"], tier: "C" },
  { name: "Hayabusa", roles: ["Assassin"], tier: "C" },
  { name: "Helcurt", roles: ["Assassin"], tier: "B" },
  { name: "Hilda", roles: ["Fighter", "Tank"], tier: "A" },
  { name: "Hirara", roles: ["Assassin"], tier: "A" },
  { name: "Hylos", roles: ["Tank"], tier: "C" },
  { name: "Irithel", roles: ["Marksman"], tier: "A" },
  { name: "Ixia", roles: ["Marksman"], tier: "C" },
  { name: "Jawhead", roles: ["Fighter"], tier: "C" },
  { name: "Johnson", roles: ["Tank", "Support"], tier: "B" },
  { name: "Joy", roles: ["Assassin"], tier: "C" },
  { name: "Julian", roles: ["Assassin", "Fighter"], tier: "B" },
  { name: "Kadita", roles: ["Mage", "Assassin"], tier: "A" },
  { name: "Kagura", roles: ["Mage"], tier: "B" },
  { name: "Kaja", roles: ["Support"], tier: "C" },
  { name: "Kalea", roles: ["Support", "Fighter"], tier: "D" },
  { name: "Karina", roles: ["Assassin"], tier: "D" },
  { name: "Karrie", roles: ["Marksman"], tier: "C" },
  { name: "Khaleed", roles: ["Fighter"], tier: "B" },
  { name: "Khufra", roles: ["Tank"], tier: "S" },
  { name: "Kimmy", roles: ["Marksman", "Mage"], tier: "C" },
  { name: "Lancelot", roles: ["Assassin"], tier: "D" },
  { name: "Lapu-Lapu", roles: ["Fighter"], tier: "C" },
  { name: "Layla", roles: ["Marksman"], tier: "C" },
  { name: "Leomord", roles: ["Fighter"], tier: "B" },
  { name: "Lesley", roles: ["Marksman", "Assassin"], tier: "C" },
  { name: "Ling", roles: ["Assassin"], tier: "A" },
  { name: "Lolita", roles: ["Support", "Tank"], tier: "A" },
  { name: "Lukas", roles: ["Fighter"], tier: "A" },
  { name: "Lunox", roles: ["Mage"], tier: "C" },
  { name: "Luo Yi", roles: ["Mage"], tier: "D" },
  { name: "Lylia", roles: ["Mage"], tier: "C" },
  { name: "Marcel", roles: ["Support"], tier: "S" },
  { name: "Martis", roles: ["Fighter"], tier: "C" },
  { name: "Masha", roles: ["Fighter", "Tank"], tier: "S" },
  { name: "Mathilda", roles: ["Support", "Assassin"], tier: "D" },
  { name: "Melissa", roles: ["Marksman"], tier: "S" },
  { name: "Minotaur", roles: ["Tank", "Support"], tier: "S" },
  { name: "Minsitthar", roles: ["Fighter"], tier: "A" },
  { name: "Miya", roles: ["Marksman"], tier: "A" },
  { name: "Moskov", roles: ["Marksman"], tier: "B" },
  { name: "Nana", roles: ["Mage"], tier: "C" },
  { name: "Natalia", roles: ["Assassin"], tier: "B" },
  { name: "Natan", roles: ["Marksman"], tier: "B" },
  { name: "Nolan", roles: ["Assassin"], tier: "C" },
  { name: "Novaria", roles: ["Mage"], tier: "C" },
  { name: "Obsidia", roles: ["Marksman"], tier: "C" },
  { name: "Odette", roles: ["Mage"], tier: "B" },
  { name: "Paquito", roles: ["Fighter", "Assassin"], tier: "A" },
  { name: "Pharsa", roles: ["Mage"], tier: "D" },
  { name: "Phoveus", roles: ["Fighter"], tier: "C" },
  { name: "Popol and Kupa", roles: ["Marksman"], tier: "A" },
  { name: "Rafaela", roles: ["Support"], tier: "S" },
  { name: "Roger", roles: ["Fighter", "Marksman"], tier: "C" },
  { name: "Ruby", roles: ["Fighter"], tier: "B" },
  { name: "Saber", roles: ["Assassin"], tier: "B" },
  { name: "Selena", roles: ["Assassin", "Mage"], tier: "C" },
  { name: "Silvanna", roles: ["Fighter"], tier: "A" },
  { name: "Sora", roles: ["Fighter", "Assassin"], tier: "B" },
  { name: "Sun", roles: ["Fighter"], tier: "S" },
  { name: "Suyou", roles: ["Assassin", "Fighter"], tier: "B" },
  { name: "Terizla", roles: ["Fighter", "Tank"], tier: "B" },
  { name: "Thamuz", roles: ["Fighter"], tier: "B" },
  { name: "Tigreal", roles: ["Tank"], tier: "C" },
  { name: "Uranus", roles: ["Tank"], tier: "B" },
  { name: "Vale", roles: ["Mage"], tier: "B" },
  { name: "Valentina", roles: ["Mage"], tier: "D" },
  { name: "Valir", roles: ["Mage"], tier: "A" },
  { name: "Vexana", roles: ["Mage"], tier: "B" },
  { name: "Wanwan", roles: ["Marksman"], tier: "C" },
  { name: "X.Borg", roles: ["Fighter"], tier: "B" },
  { name: "Xavier", roles: ["Mage"], tier: "C" },
  { name: "Yi Sun-shin", roles: ["Assassin", "Marksman"], tier: "A" },
  { name: "Yin", roles: ["Fighter", "Assassin"], tier: "C" },
  { name: "Yu Zhong", roles: ["Fighter"], tier: "B" },
  { name: "Yve", roles: ["Mage"], tier: "B" },
  { name: "Zetian", roles: ["Mage"], tier: "A" },
  { name: "Zhask", roles: ["Mage"], tier: "B" },
  { name: "Zhuxin", roles: ["Mage"], tier: "C" },
  { name: "Zilong", roles: ["Fighter", "Assassin"], tier: "D" },
];

const TIER_ORDER = { S: 0, A: 1, B: 2, C: 3, D: 4 };

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function useSharedList(key) {
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const ref = doc(db, "mlbb-naija", key);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const d = snap.exists() ? snap.data() : { list: [] };
        setData(d.list || []);
        setLoaded(true);
      },
      (err) => {
        console.error("firestore read failed", err);
        setLoaded(true);
      }
    );
    return () => unsub();
  }, [key]);

  const save = useCallback(
    async (next) => {
      setData(next);
      try {
        await setDoc(doc(db, "mlbb-naija", key), { list: next });
      } catch (e) {
        console.error("firestore save failed", e);
      }
    },
    [key]
  );

  return [data, save, loaded];
}

export default function App() {
  const [tab, setTab] = useState("profile");
  const [me, setMe] = useState(null);
  const [meLoaded, setMeLoaded] = useState(false);

  const [players, setPlayers] = useSharedList("players");
  const [squads, setSquads] = useSharedList("squads");
  const [tournaments, setTournaments] = useSharedList("tournaments");
  const [news, setNews] = useSharedList("news");

  useEffect(() => {
    const saved = localStorage.getItem("mlbb-naija-my-id");
    if (saved) setMe(saved);
    setMeLoaded(true);
  }, []);

  const myProfile = players.find((p) => p.id === me);

  async function registerPlayer(form) {
    const id = uid();
    const player = { id, ...form, joined: new Date().toISOString().slice(0, 10) };
    await setPlayers([...players, player]);
    localStorage.setItem("mlbb-naija-my-id", id);
    setMe(id);
  }

  async function logOut() {
    setMe(null);
    localStorage.removeItem("mlbb-naija-my-id");
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "squads", label: "Squads", icon: Users },
    { id: "tournaments", label: "Tourneys", icon: Trophy },
    { id: "meta", label: "Meta", icon: Swords },
    { id: "news", label: "News", icon: Newspaper },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#05070B", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* header */}
      <header style={{ borderBottom: "1px solid #1B2029", position: "sticky", top: 0, background: "#05070Bcc", backdropFilter: "blur(8px)", zIndex: 10 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, letterSpacing: 0.5, color: "#E8ECF1" }}>
              MLBB<span style={{ color: "#00D9C0" }}>NAIJA</span>
            </span>
            <div style={{ fontSize: 11, color: "#5C6472", letterSpacing: 0.4 }}>NAIJA'S LAND OF LEGENDS</div>
          </div>
          <nav style={{ display: "flex", gap: 4, background: "#0B0E14", border: "1px solid #1B2029", borderRadius: 10, padding: 4 }}>
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    background: active ? "#141922" : "none",
                    border: "none",
                    borderRadius: 7,
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                    color: active ? "#00D9C0" : "#8B94A3",
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  <Icon size={15} strokeWidth={active ? 2.4 : 1.8} />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* body */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 60px" }}>
        {tab === "profile" && (
          <ProfileTab
            meLoaded={meLoaded}
            myProfile={myProfile}
            players={players}
            onRegister={registerPlayer}
            onLogOut={logOut}
          />
        )}
        {tab === "squads" && (
          <SquadsTab squads={squads} setSquads={setSquads} myProfile={myProfile} />
        )}
        {tab === "tournaments" && (
          <TournamentsTab tournaments={tournaments} setTournaments={setTournaments} myProfile={myProfile} />
        )}
        {tab === "meta" && <MetaTab />}
        {tab === "news" && <NewsTab news={news} setNews={setNews} myProfile={myProfile} />}
      </main>
    </div>
  );
}

function Section({ title, action, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700, color: "#E8ECF1", letterSpacing: 0.4, margin: 0, textTransform: "uppercase" }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return <div style={{ fontSize: 13, color: "#5C6472", padding: "18px 0", textAlign: "center", border: "1px dashed #1B2029", borderRadius: 10 }}>{text}</div>;
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, color: "#8B94A3", display: "block", marginBottom: 5, letterSpacing: 0.3 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "#141922",
          border: "1px solid #262B34",
          borderRadius: 8,
          padding: "10px 12px",
          color: "#E8ECF1",
          fontSize: 13,
          boxSizing: "border-box",
          outline: "none",
        }}
      />
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        background: disabled ? "#1B2029" : "linear-gradient(90deg, #00D9C0, #00B8A3)",
        color: disabled ? "#5C6472" : "#05070B",
        border: "none",
        borderRadius: 8,
        padding: "11px 0",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 0.3,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function ProfileTab({ meLoaded, myProfile, players, onRegister, onLogOut }) {
  const [form, setForm] = useState({ realName: "", inGameName: "", inGameId: "", email: "" });

  if (!meLoaded) return null;

  if (!myProfile) {
    const canSubmit = form.realName && form.inGameName && form.inGameId && form.email;
    return (
      <div>
        <Section title="Create your profile">
          <Field label="Full name" value={form.realName} onChange={(v) => setForm({ ...form, realName: v })} placeholder="e.g. Gaius Osaretin" />
          <Field label="In-game name" value={form.inGameName} onChange={(v) => setForm({ ...form, inGameName: v })} placeholder="e.g. G-Vibez" />
          <Field label="In-game ID" value={form.inGameId} onChange={(v) => setForm({ ...form, inGameId: v })} placeholder="e.g. 123456789 (1234)" />
          <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@email.com" type="email" />
          <PrimaryButton disabled={!canSubmit} onClick={() => onRegister(form)}>
            Register
          </PrimaryButton>
        </Section>
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: "#141922", border: "1px solid #262B34", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#E8ECF1" }}>{myProfile.inGameName}</div>
            <div style={{ fontSize: 12, color: "#8B94A3", marginTop: 2 }}>{myProfile.realName}</div>
          </div>
          <button onClick={onLogOut} style={{ background: "none", border: "none", color: "#5C6472", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
            <LogOut size={13} /> Log out
          </button>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 11.5, color: "#5C6472" }}>
          <span>ID: <span style={{ color: "#8B94A3" }}>{myProfile.inGameId}</span></span>
          <span>Joined: <span style={{ color: "#8B94A3" }}>{myProfile.joined}</span></span>
        </div>
      </div>

      <Section title={`Registered players (${players.length})`}>
        {players.length === 0 ? (
          <EmptyState text="No players yet." />
        ) : (
          players.slice().reverse().map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #1B2029", fontSize: 13 }}>
              <span style={{ color: "#E8ECF1" }}>{p.inGameName}</span>
              <span style={{ color: "#5C6472" }}>{p.inGameId}</span>
            </div>
          ))
        )}
      </Section>
    </div>
  );
}

function SquadsTab({ squads, setSquads, myProfile }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", tag: "" });

  async function createSquad() {
    if (!form.name || !form.tag || !myProfile) return;
    const squad = { id: uid(), name: form.name, tag: form.tag.toUpperCase(), members: [myProfile.id], leader: myProfile.id, created: new Date().toISOString().slice(0, 10) };
    await setSquads([...squads, squad]);
    setForm({ name: "", tag: "" });
    setShowForm(false);
  }

  async function joinSquad(squadId) {
    if (!myProfile) return;
    const next = squads.map((s) => (s.id === squadId && !s.members.includes(myProfile.id) ? { ...s, members: [...s.members, myProfile.id] } : s));
    await setSquads(next);
  }

  return (
    <div>
      {!myProfile && <EmptyState text="Create a profile first to create or join a squad." />}

      <Section
        title="Squads"
        action={
          myProfile && (
            <button onClick={() => setShowForm(!showForm)} style={{ background: "none", border: "none", color: "#00D9C0", cursor: "pointer", display: "flex", alignItems: "center", fontSize: 11, gap: 3 }}>
              {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "New"}
            </button>
          )
        }
      >
        {showForm && (
          <div style={{ background: "#141922", border: "1px solid #262B34", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <Field label="Squad name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Benin Blitz" />
            <Field label="Tag" value={form.tag} onChange={(v) => setForm({ ...form, tag: v })} placeholder="e.g. BNBZ" />
            <PrimaryButton onClick={createSquad} disabled={!form.name || !form.tag}>
              Create squad
            </PrimaryButton>
          </div>
        )}

        {squads.length === 0 ? (
          <EmptyState text="No squads yet. Be the first to create one." />
        ) : (
          squads.slice().reverse().map((s) => {
            const isMember = myProfile && s.members.includes(myProfile.id);
            return (
              <div key={s.id} style={{ background: "#141922", border: "1px solid #262B34", borderRadius: 10, padding: 13, marginBottom: 10 }}>
                <div style={
