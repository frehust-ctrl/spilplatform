// The platform portal: a catalog of games, a page per game, and a full-screen player.
// It only reads catalog.json, which the publish/promote tools maintain.

type Channel = "prod" | "dev";

interface Version {
  version: string;
  date: string;
  notes: string;
}
interface Game {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  cover?: string;
  tags: string[];
  channels: Record<Channel, string | null>;
  versions: Version[];
}
interface Catalog {
  updated: string | null;
  platform?: { title: string; tagline: string };
  games: Game[];
}

const app = document.getElementById("app")!;
const CHANNEL_KEY = "platform.channel";
let catalog: Catalog = { updated: null, games: [] };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });

function getChannel(): Channel {
  try {
    return localStorage.getItem(CHANNEL_KEY) === "dev" ? "dev" : "prod";
  } catch {
    return "prod";
  }
}
function setChannel(c: Channel) {
  try {
    localStorage.setItem(CHANNEL_KEY, c);
  } catch {
    /* ignore */
  }
  document.body.classList.toggle("dev", c === "dev");
  document.querySelectorAll<HTMLButtonElement>("[data-channel]").forEach((b) => b.classList.toggle("active", b.dataset.channel === c));
  route();
}

const CHANNEL_NAME: Record<Channel, string> = { prod: "Live", dev: "Dev" };

function channelBadge(c: Channel) {
  return `<span class="badge ${c}">${CHANNEL_NAME[c]}</span>`;
}

// ---- Pages -----------------------------------------------------------------------------

function catalogPage() {
  const ch = getChannel();
  const cards = catalog.games.map((g) => {
    const v = g.channels[ch];
    return `<a class="card ${v ? "" : "soon"}" href="#/spil/${g.slug}">
      <div class="cover">${g.cover ? `<img src="${esc(g.cover)}" alt="" loading="lazy">` : ""}</div>
      <div class="card-body">
        <h3>${esc(g.title)}</h3>
        <p>${esc(g.tagline)}</p>
        <div class="meta">${g.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
          <span class="ver">${v ? `v${esc(v)}` : "Kommer snart"}</span></div>
      </div>
    </a>`;
  });
  app.innerHTML = `
    <section class="hero">
      <h1>${esc(catalog.platform?.tagline ?? "Bibliotek")}</h1>
      <p>${catalog.games.length} ${catalog.games.length === 1 ? "spil" : "spil"} · ${ch === "dev" ? "Du ser <b>Dev</b>-kanalen – de nyeste, utestede versioner." : "Spil direkte i browseren – intet at installere."}</p>
    </section>
    <section class="grid">${cards.join("") || `<p class="empty">Ingen spil endnu.</p>`}</section>`;
}

function gamePage(g: Game) {
  const ch = getChannel();
  const v = g.channels[ch];
  const other: Channel = ch === "prod" ? "dev" : "prod";
  app.innerHTML = `
    <section class="game">
      <div class="game-cover">${g.cover ? `<img src="${esc(g.cover)}" alt="${esc(g.title)}">` : ""}</div>
      <div class="game-info">
        <a class="back" href="#/">← Bibliotek</a>
        <h1>${esc(g.title)}</h1>
        <p class="tagline">${esc(g.tagline)}</p>
        <div class="meta">${g.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <p class="desc">${esc(g.description)}</p>
        ${v
          ? `<a class="play" href="#/spil/${g.slug}/spil">▶ Spil nu</a>
             <p class="muted">Version ${esc(v)} ${channelBadge(ch)}${g.channels[other] && g.channels[other] !== v ? ` · ${CHANNEL_NAME[other]}: ${esc(g.channels[other]!)}` : ""}</p>`
          : `<p class="soon-note">Ikke udgivet på ${CHANNEL_NAME[ch]} endnu.${g.channels[other] ? ` Skift til ${CHANNEL_NAME[other]} for at spille version ${esc(g.channels[other]!)}.` : ""}</p>`}
        <p class="muted small">Dit spil gemmes i browseren. ${CHANNEL_NAME.prod} og ${CHANNEL_NAME.dev} har hver deres gemte spil.</p>
      </div>
    </section>`;
}

function playPage(g: Game) {
  const ch = getChannel();
  const v = g.channels[ch];
  if (!v) return gamePage(g);
  document.body.classList.add("playing");
  app.innerHTML = `
    <div class="player">
      <div class="player-bar">
        <a class="back" href="#/spil/${g.slug}">← ${esc(g.title)}</a>
        <span class="muted">v${esc(v)}</span>${channelBadge(ch)}
        <span class="spacer"></span>
        <button id="fullscreen" title="Fuld skærm">⛶ Fuld skærm</button>
      </div>
      <iframe id="game-frame" src="games/${g.slug}/${encodeURIComponent(v)}/index.html?channel=${ch}" title="${esc(g.title)}" allow="fullscreen; autoplay"></iframe>
    </div>`;
  document.getElementById("fullscreen")!.onclick = () => document.getElementById("game-frame")!.requestFullscreen?.();
}

function notFound() {
  app.innerHTML = `<section class="hero"><h1>Ikke fundet</h1><p><a href="#/">Tilbage til biblioteket</a></p></section>`;
}

// ---- Routing (hash based, so it works on GitHub Pages without server rules) -------------

function route() {
  document.body.classList.remove("playing");
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (!parts.length) return catalogPage();
  if (parts[0] === "spil" && parts[1]) {
    const g = catalog.games.find((x) => x.slug === parts[1]);
    if (!g) return notFound();
    document.title = `${g.title} – ${document.getElementById("brand-title")!.textContent}`;
    return parts[2] === "spil" ? playPage(g) : gamePage(g);
  }
  notFound();
}

async function start() {
  document.querySelectorAll<HTMLButtonElement>("[data-channel]").forEach((b) => (b.onclick = () => setChannel(b.dataset.channel as Channel)));
  try {
    const res = await fetch("catalog.json", { cache: "no-cache" });
    catalog = await res.json();
  } catch {
    app.innerHTML = `<section class="hero"><h1>Kataloget kunne ikke hentes</h1><p>Prøv at genindlæse siden.</p></section>`;
    return;
  }
  if (catalog.platform) {
    document.getElementById("brand-title")!.textContent = catalog.platform.title;
    document.title = catalog.platform.title;
  }
  window.addEventListener("hashchange", route);
  setChannel(getChannel());
}

start();
