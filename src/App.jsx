import React, { useState, useEffect, useCallback } from "react";
import { User, Users, Trophy, Swords, Newspaper, Plus, X, LogOut, Shield, Calendar, Award, ChevronRight } from "lucide-react";
import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { HERO_META, TIER_ORDER } from "./heroData";

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
    { id: "heroes", label: "Heroes", icon: Swords },
    { id: "news", label: "News", icon: Newspaper },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 900px 500px at 8% -5%, #00D9C022, transparent), radial-gradient(ellipse 700px 500px at 100% 15%, #FFB80014, transparent), #05070B",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* header */}
      <header
        style={{
          borderBottom: "1px solid #1B2029",
          position: "sticky",
          top: 0,
          background: "#05070Bd9",
          backdropFilter: "blur(10px)",
          zIndex: 10,
          boxShadow: "0 1px 0 #00D9C01a",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                flexShrink: 0,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                background: "linear-gradient(145deg, #00D9C0, #0A8F80)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px #00D9C055",
              }}
            >
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, fontSize: 15, color: "#05070B" }}>MN</span>
            </div>
            <div>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: 0.5, color: "#E8ECF1", lineHeight: 1 }}>
                MLBB<span style={{ color: "#00D9C0" }}>NAIJA</span>
              </span>
              <div style={{ fontSize: 10, color: "#5C6472", letterSpacing: 1.2, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00A651", boxShadow: "0 0 6px #00A651", flexShrink: 0 }} />
                NAIJA'S LAND OF LEGENDS
              </div>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 2, background: "#0B0E14", border: "1px solid #1B2029", borderRadius: 10, padding: 3 }}>
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
                    boxShadow: active ? "inset 0 -2px 0 #00D9C0" : "none",
                    transition: "color 0.15s",
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
        {tab === "heroes" && <HeroesTab />}
        {tab === "news" && <NewsTab news={news} setNews={setNews} myProfile={myProfile} />}
      </main>

      <footer style={{ borderTop: "1px solid #1B2029", padding: "20px", textAlign: "center" }}>
        <span style={{ fontSize: 10.5, color: "#3A4150", letterSpacing: 0.5 }}>MLBB NAIJA · BUILT BY THE COMMUNITY, FOR THE COMMUNITY</span>
      </footer>
    </div>
  );
}

function Section({ title, action, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700, color: "#E8ECF1", letterSpacing: 0.4, margin: 0, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 3, height: 15, background: "linear-gradient(#00D9C0, #FFB800)", borderRadius: 2, display: "inline-block" }} />
          {title}
        </h2>
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
        boxShadow: disabled ? "none" : "0 4px 20px -6px #00D9C088",
        transition: "box-shadow 0.15s, transform 0.1s",
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
      <div
        style={{
          background: "linear-gradient(160deg, #141922cc, #0E1219cc)",
          backdropFilter: "blur(10px)",
          border: "1px solid #00D9C033",
          borderRadius: 14,
          padding: 18,
          marginBottom: 20,
          boxShadow: "0 12px 30px -14px #00D9C044, inset 0 1px 0 #ffffff0d",
        }}
      >
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#E8ECF1" }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "#00D9C0", letterSpacing: 0.5 }}>[{s.tag}]</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#8B94A3" }}>
                      <Shield size={11} style={{ verticalAlign: -1, marginRight: 3 }} />
                      {s.members.length} member{s.members.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                {myProfile && !isMember && (
                  <button
                    onClick={() => joinSquad(s.id)}
                    style={{ marginTop: 10, width: "100%", background: "#1B2029", border: "1px solid #262B34", color: "#00D9C0", borderRadius: 6, padding: "7px 0", fontSize: 12, cursor: "pointer" }}
                  >
                    Join squad
                  </button>
                )}
                {isMember && <div style={{ marginTop: 8, fontSize: 11, color: "#00A651" }}>✓ You're in this squad</div>}
              </div>
            );
          })
        )}
      </Section>
    </div>
  );
}

function TournamentsTab({ tournaments, setTournaments, myProfile }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", prize: "", description: "" });

  async function postTournament() {
    if (!form.title || !form.date) return;
    const t = { id: uid(), ...form, applicants: [], posted: new Date().toISOString().slice(0, 10) };
    await setTournaments([...tournaments, t]);
    setForm({ title: "", date: "", prize: "", description: "" });
    setShowForm(false);
  }

  async function apply(id) {
    if (!myProfile) return;
    const next = tournaments.map((t) => (t.id === id && !t.applicants.includes(myProfile.id) ? { ...t, applicants: [...t.applicants, myProfile.id] } : t));
    await setTournaments(next);
  }

  return (
    <div>
      <Section
        title="Tournaments"
        action={
          <button onClick={() => setShowForm(!showForm)} style={{ background: "none", border: "none", color: "#FFB800", cursor: "pointer", display: "flex", alignItems: "center", fontSize: 11, gap: 3 }}>
            {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "Post"}
          </button>
        }
      >
        <div style={{ fontSize: 10.5, color: "#5C6472", marginBottom: 12 }}>
          In production, posting is restricted to app owners/admins — open here for prototype testing.
        </div>

        {showForm && (
          <div style={{ background: "#141922", border: "1px solid #262B34", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <Field label="Tournament title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. Naija Clash Cup" />
            <Field label="Date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} type="date" />
            <Field label="Prize pool" value={form.prize} onChange={(v) => setForm({ ...form, prize: v })} placeholder="e.g. ₦100,000" />
            <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Format, rules, requirements" />
            <PrimaryButton onClick={postTournament} disabled={!form.title || !form.date} style={{ background: "linear-gradient(90deg, #FFB800, #E5A400)", color: "#05070B" }}>
              Post tournament
            </PrimaryButton>
          </div>
        )}

        {tournaments.length === 0 ? (
          <EmptyState text="No tournaments posted yet." />
        ) : (
          tournaments.slice().reverse().map((t) => {
            const applied = myProfile && t.applicants.includes(myProfile.id);
            return (
              <div key={t.id} style={{ background: "#141922", border: "1px solid #262B34", borderRadius: 10, padding: 13, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#E8ECF1" }}>{t.title}</div>
                  {t.prize && <div style={{ fontSize: 11, color: "#FFB800", fontWeight: 700 }}>{t.prize}</div>}
                </div>
                <div style={{ fontSize: 11, color: "#8B94A3", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={11} /> {t.date || "TBA"}
                </div>
                {t.description && <div style={{ fontSize: 12, color: "#8B94A3", marginTop: 6 }}>{t.description}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <span style={{ fontSize: 11, color: "#5C6472" }}>{t.applicants.length} applied</span>
                  {myProfile && !applied && (
                    <button onClick={() => apply(t.id)} style={{ background: "#1B2029", border: "1px solid #262B34", color: "#FFB800", borderRadius: 6, padding: "6px 12px", fontSize: 11.5, cursor: "pointer" }}>
                      Apply
                    </button>
                  )}
                  {applied && <span style={{ fontSize: 11, color: "#00A651" }}>✓ Applied</span>}
                </div>
              </div>
            );
          })
        )}
      </Section>
    </div>
  );
}

function HeroesTab() {
  const [section, setSection] = useState("tierlist");
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "#0B0E14", border: "1px solid #1B2029", borderRadius: 10, padding: 4 }}>
        {[
          { id: "tierlist", label: "Tier List" },
          { id: "drafts", label: "Draft History" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              flex: 1,
              background: section === s.id ? "#141922" : "none",
              border: "none",
              borderRadius: 7,
              padding: "9px 0",
              cursor: "pointer",
              color: section === s.id ? "#00D9C0" : "#8B94A3",
              fontSize: 13,
              fontWeight: section === s.id ? 700 : 500,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
      {section === "tierlist" ? <TierListView /> : <DraftsView />}
    </div>
  );
}

function HeroAvatar({ name, role, size = 40 }) {
  const [imgFailed, setImgFailed] = useState(false);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const initials = name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const color = ROLE_COLORS[role] || "#8B94A3";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: imgFailed || !name ? `linear-gradient(135deg, ${color}33, ${color}11)` : "#141922",
        border: `1.5px solid ${color}88`,
        boxShadow: `0 3px 10px -3px ${color}66, inset 0 1px 0 #ffffff11`,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: size * 0.34,
        flexShrink: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {!imgFailed && (
        <img
          src={`/heroes/${slug}.jpg`}
          alt={name}
          onError={() => setImgFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
        />
      )}
      {imgFailed && initials}
    </div>
  );
}

function TierListView() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const tiersOrder = ["S", "A", "B", "C", "D"];
  const tierLabel = { S: "S (META)", A: "A (STRONG)", B: "B (VIABLE)", C: "C (SITUATIONAL)", D: "D (WEAK)" };

  const bySearch = search
    ? HERO_META.filter((h) => h.name.toLowerCase().includes(search.toLowerCase()))
    : HERO_META;

  return (
    <div>
      <div style={{ fontSize: 10.5, color: "#5C6472", marginBottom: 14, lineHeight: 1.5 }}>
        Full 133-hero roster grouped by current-patch tier. Heroes with a <span style={{ color: "#FFB800" }}>●</span> gold dot have a full skills/build/emblem breakdown — tap any hero to open it. The rest are rolling out in batches.
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search hero..."
        style={{
          width: "100%",
          background: "#141922",
          border: "1px solid #262B34",
          borderRadius: 8,
          padding: "9px 12px",
          color: "#E8ECF1",
          fontSize: 13,
          boxSizing: "border-box",
          outline: "none",
          marginBottom: 16,
        }}
      />

      {tiersOrder.map((t) => {
        const heroes = bySearch.filter((h) => h.tier === t).sort((a, b) => a.name.localeCompare(b.name));
        if (heroes.length === 0) return null;
        return (
          <div
            key={t}
            style={{
              display: "flex",
              marginBottom: 10,
              borderRadius: 12,
              overflow: "hidden",
              border: `1px solid ${TIER_COLORS[t]}33`,
              background: `linear-gradient(90deg, ${TIER_COLORS[t]}14, #0E1219 22%)`,
              boxShadow: `0 4px 24px -12px ${TIER_COLORS[t]}55`,
            }}
          >
            <div
              style={{
                width: 64,
                flexShrink: 0,
                background: `${TIER_COLORS[t]}20`,
                borderRight: `2px solid ${TIER_COLORS[t]}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 4px",
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: TIER_COLORS[t], textShadow: `0 0 16px ${TIER_COLORS[t]}77` }}>{t}</div>
              <div style={{ fontSize: 7.5, color: TIER_COLORS[t], textAlign: "center", letterSpacing: 0.3, marginTop: 2, opacity: 0.85 }}>
                {tierLabel[t].split(" ")[1]?.replace(/[()]/g, "")}
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 10, padding: "12px 10px" }}>
              {heroes.map((h) => (
                <button
                  key={h.name}
                  onClick={() => setSelected(h)}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 54, position: "relative" }}
                >
                  <div style={{ position: "relative" }}>
                    <HeroAvatar name={h.name} role={h.roles[0]} size={42} />
                    {h.details && (
                      <span
                        style={{
                          position: "absolute",
                          top: -2,
                          right: -2,
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          background: "#FFB800",
                          border: "1.5px solid #0E1219",
                          boxShadow: "0 0 6px #FFB800aa",
                        }}
                      />
                    )}
                  </div>
                  <span style={{ fontSize: 9, color: "#8B94A3", textAlign: "center", lineHeight: 1.1 }}>{h.name}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {selected && <HeroDetailModal hero={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function HeroDetailModal({ hero, onClose }) {
  const detail = hero.details;
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg, #141922f2, #0B0E14f7)",
          backdropFilter: "blur(14px)",
          border: "1px solid #262B34",
          borderTop: "2px solid #00D9C066",
          borderRadius: "18px 18px 0 0",
          width: "100%",
          maxWidth: 420,
          maxHeight: "82vh",
          overflowY: "auto",
          padding: 20,
          boxShadow: "0 -20px 50px -20px #00D9C033",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <HeroAvatar name={hero.name} role={hero.roles[0]} size={52} />
            <div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#E8ECF1" }}>{hero.name}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                {hero.roles.map((r) => (
                  <span key={r} style={{ fontSize: 9.5, color: ROLE_COLORS[r], border: `1px solid ${ROLE_COLORS[r]}55`, borderRadius: 4, padding: "1px 6px" }}>
                    {r}
                  </span>
                ))}
                <span style={{ fontSize: 9.5, color: TIER_COLORS[hero.tier], border: `1px solid ${TIER_COLORS[hero.tier]}55`, borderRadius: 4, padding: "1px 6px" }}>
                  {hero.tier} Tier
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#141922", border: "1px solid #262B34", borderRadius: 8, width: 30, height: 30, color: "#8B94A3", cursor: "pointer" }}>
            <X size={15} style={{ margin: "0 auto" }} />
          </button>
        </div>

        {!detail ? (
          <EmptyState text="Full skill, build, and emblem breakdown for this hero hasn't been added yet — it's rolling out in batches." />
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#00D9C0", letterSpacing: 0.4, marginBottom: 6, textTransform: "uppercase" }}>Passive — {detail.passive.name}</div>
              <div style={{ fontSize: 12.5, color: "#8B94A3", lineHeight: 1.5 }}>{detail.passive.desc}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#00D9C0", letterSpacing: 0.4, marginBottom: 8, textTransform: "uppercase" }}>Skills</div>
              {detail.skills.map((s, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E8ECF1" }}>
                    {s.name} <span style={{ fontSize: 10, color: "#5C6472", fontWeight: 500 }}>· {s.type}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#8B94A3", lineHeight: 1.5, marginTop: 2 }}>{s.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#FFB800", letterSpacing: 0.4, marginBottom: 6, textTransform: "uppercase" }}>Recommended Build</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {detail.build.map((item) => (
                  <span key={item} style={{ fontSize: 11, color: "#E8ECF1", background: "#141922", border: "1px solid #262B34", borderRadius: 6, padding: "4px 8px" }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16, display: "flex", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#FFB800", letterSpacing: 0.4, marginBottom: 6, textTransform: "uppercase" }}>Emblem</div>
                <div style={{ fontSize: 12.5, color: "#E8ECF1", fontWeight: 700 }}>{detail.emblem.type}</div>
                <div style={{ fontSize: 11.5, color: "#8B94A3", marginTop: 2 }}>{detail.emblem.talents.join(" → ")}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#FFB800", letterSpacing: 0.4, marginBottom: 6, textTransform: "uppercase" }}>Battle Spell</div>
                <div style={{ fontSize: 12.5, color: "#E8ECF1", fontWeight: 700 }}>{detail.spell}</div>
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#00A651", letterSpacing: 0.4, marginBottom: 6, textTransform: "uppercase" }}>Strong Against</div>
              <div style={{ fontSize: 12.5, color: "#8B94A3", lineHeight: 1.5 }}>{detail.strongAgainst.join(" · ")}</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#FF6B4A", letterSpacing: 0.4, marginBottom: 6, textTransform: "uppercase" }}>Weak Against</div>
              <div style={{ fontSize: 12.5, color: "#8B94A3", lineHeight: 1.5 }}>{detail.weakAgainst.join(" · ")}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#B678FF", letterSpacing: 0.4, marginBottom: 6, textTransform: "uppercase" }}>Works Well With</div>
              <div style={{ fontSize: 12.5, color: "#8B94A3", lineHeight: 1.5 }}>{detail.goodWith.join(" · ")}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DraftsView() {
  const [drafts, setDrafts] = useSharedList("drafts");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ event: "", date: "", teamA: "", teamB: "", picksA: "", picksB: "", bansA: "", bansB: "", winner: "" });

  async function submit() {
    if (!form.event || !form.teamA || !form.teamB) return;
    const d = { id: uid(), ...form, added: new Date().toISOString().slice(0, 10) };
    await setDrafts([d, ...drafts]);
    setForm({ event: "", date: "", teamA: "", teamB: "", picksA: "", picksB: "", bansA: "", bansB: "", winner: "" });
    setShowForm(false);
  }

  return (
    <div>
      <div style={{ fontSize: 10.5, color: "#5C6472", marginBottom: 14, lineHeight: 1.5 }}>
        A real log of pro/tournament drafts — MPL, MSC, M-Series, and community events — built by the app owners and community over time. Nothing here is simulated; entries are added as real matches are logged.
      </div>

      <PrimaryButton onClick={() => setShowForm(!showForm)} style={{ marginBottom: 14, background: showForm ? "#1B2029" : "linear-gradient(90deg, #B678FF, #9B5CE0)", color: showForm ? "#8B94A3" : "#05070B" }}>
        {showForm ? "Cancel" : "+ Log a Draft"}
      </PrimaryButton>

      {showForm && (
        <div style={{ background: "#141922", border: "1px solid #262B34", borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <Field label="Event / Tournament" value={form.event} onChange={(v) => setForm({ ...form, event: v })} placeholder="e.g. MPL PH S15, Grand Finals" />
          <Field label="Date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} type="date" />
          <Field label="Team A" value={form.teamA} onChange={(v) => setForm({ ...form, teamA: v })} placeholder="e.g. ONIC" />
          <Field label="Team A picks" value={form.picksA} onChange={(v) => setForm({ ...form, picksA: v })} placeholder="Comma-separated heroes" />
          <Field label="Team A bans" value={form.bansA} onChange={(v) => setForm({ ...form, bansA: v })} placeholder="Comma-separated heroes" />
          <Field label="Team B" value={form.teamB} onChange={(v) => setForm({ ...form, teamB: v })} placeholder="e.g. Blacklist International" />
          <Field label="Team B picks" value={form.picksB} onChange={(v) => setForm({ ...form, picksB: v })} placeholder="Comma-separated heroes" />
          <Field label="Team B bans" value={form.bansB} onChange={(v) => setForm({ ...form, bansB: v })} placeholder="Comma-separated heroes" />
          <Field label="Winner" value={form.winner} onChange={(v) => setForm({ ...form, winner: v })} placeholder="Team name" />
          <PrimaryButton onClick={submit} disabled={!form.event || !form.teamA || !form.teamB} style={{ background: "linear-gradient(90deg, #B678FF, #9B5CE0)", color: "#05070B" }}>
            Save Draft
          </PrimaryButton>
        </div>
      )}

      {drafts.length === 0 ? (
        <EmptyState text="No drafts logged yet. Be the first to add a real match." />
      ) : (
        drafts.map((d) => (
          <div key={d.id} style={{ background: "#141922", border: "1px solid #262B34", borderRadius: 10, padding: 13, marginBottom: 10 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#E8ECF1" }}>{d.event}</div>
            <div style={{ fontSize: 11, color: "#5C6472", margin: "3px 0 8px" }}>{d.date || "Date unknown"}</div>
            <div style={{ fontSize: 12, color: "#8B94A3", marginBottom: 4 }}>
              <span style={{ color: d.winner === d.teamA ? "#00A651" : "#E8ECF1", fontWeight: 700 }}>{d.teamA}</span>
              {" — picks: "}{d.picksA || "—"}{d.bansA && ` (bans: ${d.bansA})`}
            </div>
            <div style={{ fontSize: 12, color: "#8B94A3" }}>
              <span style={{ color: d.winner === d.teamB ? "#00A651" : "#E8ECF1", fontWeight: 700 }}>{d.teamB}</span>
              {" — picks: "}{d.picksB || "—"}{d.bansB && ` (bans: ${d.bansB})`}
            </div>
            {d.winner && <div style={{ fontSize: 11, color: "#00A651", marginTop: 6 }}>Winner: {d.winner}</div>}
          </div>
        ))
      )}
    </div>
  );
}



function NewsTab({ news, setNews, myProfile }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });

  async function postNews() {
    if (!form.title || !form.body) return;
    const n = { id: uid(), ...form, date: new Date().toISOString().slice(0, 10), author: myProfile ? myProfile.inGameName : "MLBB Naija" };
    await setNews([n, ...news]);
    setForm({ title: "", body: "" });
    setShowForm(false);
  }

  return (
    <div>
      <Section
        title="News & updates"
        action={
          <button onClick={() => setShowForm(!showForm)} style={{ background: "none", border: "none", color: "#B678FF", cursor: "pointer", display: "flex", alignItems: "center", fontSize: 11, gap: 3 }}>
            {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "Post"}
          </button>
        }
      >
        {showForm && (
          <div style={{ background: "#141922", border: "1px solid #262B34", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <Field label="Headline" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. Patch 1.9.88 hero balance" />
            <Field label="Body" value={form.body} onChange={(v) => setForm({ ...form, body: v })} placeholder="Details..." />
            <PrimaryButton onClick={postNews} disabled={!form.title || !form.body} style={{ background: "linear-gradient(90deg, #B678FF, #9B5CE0)", color: "#05070B" }}>
              Publish
            </PrimaryButton>
          </div>
        )}

        {news.length === 0 ? (
          <EmptyState text="No news posted yet." />
        ) : (
          news.map((n) => (
            <div key={n.id} style={{ padding: "12px 0", borderBottom: "1px solid #1B2029" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#E8ECF1" }}>{n.title}</div>
              <div style={{ fontSize: 11, color: "#5C6472", margin: "3px 0 6px" }}>
                {n.author} · {n.date}
              </div>
              <div style={{ fontSize: 12.5, color: "#8B94A3", lineHeight: 1.5 }}>{n.body}</div>
            </div>
          ))
        )}
      </Section>
    </div>
  );
}
