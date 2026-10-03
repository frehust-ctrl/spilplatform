(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=document.getElementById(`app`),t=`platform.channel`,n={updated:null,games:[]},r=e=>e.replace(/[&<>"']/g,e=>`&#${e.charCodeAt(0)};`),i=`platform.devmode`,a=(()=>{let e=new URLSearchParams(location.search).get(`dev`);try{return e!==null&&localStorage.setItem(i,e===`0`?`0`:`1`),localStorage.getItem(i)===`1`}catch{return e!==null&&e!==`0`}})();function o(){if(!a)return`prod`;try{return localStorage.getItem(t)===`dev`?`dev`:`prod`}catch{return`prod`}}function s(e){try{localStorage.setItem(t,e)}catch{}document.body.classList.toggle(`dev`,e===`dev`),document.querySelectorAll(`[data-channel]`).forEach(t=>t.classList.toggle(`active`,t.dataset.channel===e)),m()}var c={prod:`Live`,dev:`Dev`};function l(e){return a?`<span class="badge ${e}">${c[e]}</span>`:``}function u(){let t=o(),i=n.games.map(e=>{let n=e.channels[t];return`<a class="card ${n?``:`soon`}" href="#/spil/${e.slug}">
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
    <section class="grid">${i.join(``)||`<p class="empty">Ingen spil endnu.</p>`}</section>`}function d(t){let n=o(),i=t.channels[n],s=n===`prod`?`dev`:`prod`;e.innerHTML=`
    <section class="game">
      <div class="game-cover">${t.cover?`<img src="${r(t.cover)}" alt="${r(t.title)}">`:``}</div>
      <div class="game-info">
        <a class="back" href="#/">← Bibliotek</a>
        <h1>${r(t.title)}</h1>
        <p class="tagline">${r(t.tagline)}</p>
        <div class="meta">${t.tags.map(e=>`<span class="tag">${r(e)}</span>`).join(``)}</div>
        <p class="desc">${r(t.description)}</p>
        ${i?`<a class="play" href="#/spil/${t.slug}/spil">▶ Spil nu</a>
             <p class="muted">Version ${r(i)}${a?` ${l(n)}${t.channels[s]&&t.channels[s]!==i?` · ${c[s]}: ${r(t.channels[s])}`:``}`:``}</p>`:`<p class="soon-note">${a?`Ikke udgivet på ${c[n]} endnu.${t.channels[s]?` Skift til ${c[s]} for at spille version ${r(t.channels[s])}.`:``}`:`Kommer snart.`}</p>`}
        <p class="muted small">Dit spil gemmes i browseren.${a?` ${c.prod} og ${c.dev} har hver deres gemte spil.`:``}</p>
      </div>
    </section>`}function f(t){let n=o(),i=t.channels[n];if(!i)return d(t);document.body.classList.add(`playing`),e.innerHTML=`
    <div class="player">
      <div class="player-bar">
        <a class="back" href="#/spil/${t.slug}">← ${r(t.title)}</a>
        <span class="muted">v${r(i)}</span>${l(n)}
        <span class="spacer"></span>
        <button id="fullscreen" title="Fuld skærm">⛶ Fuld skærm</button>
      </div>
      <iframe id="game-frame" src="games/${t.slug}/${encodeURIComponent(i)}/index.html?channel=${n}" title="${r(t.title)}" allow="fullscreen; autoplay"></iframe>
    </div>`,document.getElementById(`fullscreen`).onclick=()=>document.getElementById(`game-frame`).requestFullscreen?.()}function p(){e.innerHTML=`<section class="hero"><h1>Ikke fundet</h1><p><a href="#/">Tilbage til biblioteket</a></p></section>`}function m(){document.body.classList.remove(`playing`);let e=location.hash.replace(/^#\/?/,``).split(`/`).filter(Boolean);if(!e.length)return u();if(e[0]===`spil`&&e[1]){let t=n.games.find(t=>t.slug===e[1]);return t?(document.title=`${t.title} – ${document.getElementById(`brand-title`).textContent}`,e[2]===`spil`?f(t):d(t)):p()}p()}async function h(){document.querySelectorAll(`[data-channel]`).forEach(e=>e.onclick=()=>s(e.dataset.channel)),document.querySelector(`.channel`).hidden=!a;try{n=await(await fetch(`catalog.json`,{cache:`no-cache`})).json()}catch{e.innerHTML=`<section class="hero"><h1>Kataloget kunne ikke hentes</h1><p>Prøv at genindlæse siden.</p></section>`;return}n.platform&&(document.getElementById(`brand-title`).textContent=n.platform.title,document.title=n.platform.title),window.addEventListener(`hashchange`,m),window.addEventListener(`message`,e=>{let t=document.getElementById(`game-frame`);if(!t||e.source!==t.contentWindow||e.data?.type!==`spilplatform:exit`)return;let n=location.hash.replace(/^#\/?/,``).split(`/`)[1];location.hash=n?`#/spil/${n}`:`#/`}),s(o())}h();