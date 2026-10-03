# Spilplatform

Min egen lille "Steam": et katalog over mine spil, som kan spilles direkte i browseren.
Hostes gratis på **GitHub Pages**. Hvert spil udgives i faste versioner med to kanaler:

- **Dev** – den nyeste udgivelse, til test.
- **Live (Prod)** – den version alle spiller.

## Sådan virker det

```
spilplatform/
├── games.config.json   ← spillene: titel, beskrivelse, cover, sti til spillets projekt
├── covers/             ← coverbilleder
├── portal/             ← platformens hjemmeside (katalog, spilside, afspiller)
├── tools/              ← publish / promote / rollback / deploy
└── site/               ← det GitHub Pages viser (gh-pages-grenen)
    ├── catalog.json            ← hvilke versioner findes, og hvad Dev/Live peger på
    └── games/<spil>/<version>/ ← hver udgivelse, uforanderlig
```

- En udgivet version ændres **aldrig**. Hæv versionen i spillets `package.json` for hver udgivelse.
- **Promovering bygger ikke igen**: Live får præcis de filer, du testede på Dev.
- Dev og Live har **hver deres gemte spil** (spillet får `?channel=dev|prod` og gemmer pr. kanal).

## Arbejdsgang

```bash
npm run publish-game -- bondegaarden --notes "Hvad er nyt"   # byg + udgiv til Dev
npm run preview                                         # se platformen lokalt på http://localhost:4300
npm run promote -- bondegaarden                              # Dev-versionen går Live
npm run rollback -- bondegaarden                             # Live tilbage til forrige version
npm run status                                          # alle spil, versioner og kanaler
npm run deploy                                          # læg site/ ud på GitHub Pages
```

## Nyt spil

1. Spillets byg skal bruge relative stier (Vite: `base: "./"`) og have en `version` i `package.json`.
2. Tilføj det i `games.config.json` (og et cover i `covers/`).
3. `npm run publish-game -- <slug>`

## Første gang (GitHub Pages)

```bash
git init -b main && git add -A && git commit -m "Spilplatform"
gh repo create <navn> --public --source . --push
# site/ bliver gh-pages-grenen:
mv site site.tmp
git worktree add --orphan -b gh-pages site
cp -R site.tmp/. site/ && rm -rf site.tmp
npm run deploy
gh api -X POST repos/{owner}/{repo}/pages -f "source[branch]=gh-pages" -f "source[path]=/"
```
