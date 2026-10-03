(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=document.getElementById(`app`),t=`platform.channel`,n={updated:null,games:[]},r=e=>e.replace(/[&<>"']/g,e=>`&#${e.charCodeAt(0)};`);function i(){try{return localStorage.getItem(t)===`dev`?`dev`:`prod`}catch{return`prod`}}function a(e){try{localStorage.setItem(t,e)}catch{}document.body.classList.toggle(`dev`,e===`dev`),document.querySelectorAll(`[data-channel]`).forEach(t=>t.classList.toggle(`active`,t.dataset.channel===e)),f()}var o={prod:`Live`,dev:`Dev`};function s(e){return`<span class="badge ${e}">${o[e]}</span>`}function c(){let t=i(),a=n.games.map(e=>{let n=e.channels[t];return`<a class="card ${n?``:`soon`}" href="#/spil/${e.slug}">
      <div class="cover">${e.cover?`<img src="${r(e.cover)}" alt="" loading="lazy">`:``}</div>
      <div class="card-body">
        <h3>${r(e.title)}</h3>
        <p>${r(e.tagline)}</p>
        <div class="meta">${e.tags.map(e=>`<span class="tag">${r(e)}</span>`).join(``)}
          <span class="ver">${n?`v${r(n)}`:`Kommer snart`}</span></div>
      </div>
    </a>`});e.innerHTML=`
    <section class="hero">
      <h1>${r(n.platform?.tagline??`Bibliotek`)}</h1>
      <p>${n.games.length} ${n.games.length,`spil`} · ${t===`dev`?`Du ser <b>Dev</b>-kanalen – de nyeste, utestede versioner.`:`Spil direkte i browseren – intet at installere.`}</p>
    </section>
    <section class="grid">${a.join(``)||`<p class="empty">Ingen spil endnu.</p>`}</section>`}function l(t){let n=i(),a=t.channels[n],c=n===`prod`?`dev`:`prod`;e.innerHTML=`
    <section class="game">
      <div class="game-cover">${t.cover?`<img src="${r(t.cover)}" alt="${r(t.title)}">`:``}</div>
      <div class="game-info">
        <a class="back" href="#/">← Bibliotek</a>
        <h1>${r(t.title)}</h1>
        <p class="tagline">${r(t.tagline)}</p>
        <div class="meta">${t.tags.map(e=>`<span class="tag">${r(e)}</span>`).join(``)}</div>
        <p class="desc">${r(t.description)}</p>
        ${a?`<a class="play" href="#/spil/${t.slug}/spil">▶ Spil nu</a>
             <p class="muted">Version ${r(a)} ${s(n)}${t.channels[c]&&t.channels[c]!==a?` · ${o[c]}: ${r(t.channels[c])}`:``}</p>`:`<p class="soon-note">Ikke udgivet på ${o[n]} endnu.${t.channels[c]?` Skift til ${o[c]} for at spille version ${r(t.channels[c])}.`:``}</p>`}
        <p class="muted small">Dit spil gemmes i browseren. ${o.prod} og ${o.dev} har hver deres gemte spil.</p>
      </div>
    </section>`}function u(t){let n=i(),a=t.channels[n];if(!a)return l(t);document.body.classList.add(`playing`),e.innerHTML=`
    <div class="player">
      <div class="player-bar">
        <a class="back" href="#/spil/${t.slug}">← ${r(t.title)}</a>
        <span class="muted">v${r(a)}</span>${s(n)}
        <span class="spacer"></span>
        <button id="fullscreen" title="Fuld skærm">⛶ Fuld skærm</button>
      </div>
      <iframe id="game-frame" src="games/${t.slug}/${encodeURIComponent(a)}/index.html?channel=${n}" title="${r(t.title)}" allow="fullscreen; autoplay"></iframe>
    </div>`,document.getElementById(`fullscreen`).onclick=()=>document.getElementById(`game-frame`).requestFullscreen?.()}function d(){e.innerHTML=`<section class="hero"><h1>Ikke fundet</h1><p><a href="#/">Tilbage til biblioteket</a></p></section>`}function f(){document.body.classList.remove(`playing`);let e=location.hash.replace(/^#\/?/,``).split(`/`).filter(Boolean);if(!e.length)return c();if(e[0]===`spil`&&e[1]){let t=n.games.find(t=>t.slug===e[1]);return t?(document.title=`${t.title} – ${document.getElementById(`brand-title`).textContent}`,e[2]===`spil`?u(t):l(t)):d()}d()}async function p(){document.querySelectorAll(`[data-channel]`).forEach(e=>e.onclick=()=>a(e.dataset.channel));try{n=await(await fetch(`catalog.json`,{cache:`no-cache`})).json()}catch{e.innerHTML=`<section class="hero"><h1>Kataloget kunne ikke hentes</h1><p>Prøv at genindlæse siden.</p></section>`;return}n.platform&&(document.getElementById(`brand-title`).textContent=n.platform.title,document.title=n.platform.title),window.addEventListener(`hashchange`,f),a(i())}p();