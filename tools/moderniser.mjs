/**
 * moderniser.mjs — Alignement SEO des pages écrites avant la refonte.
 *
 *   node tools/moderniser.mjs
 *
 * Applique aux pages historiques (Aniimopédia, patch notes) le même socle
 * que les pages générées : hreflang, Open Graph complet, chargement des
 * polices sans blocage, navigation et pied de page à jour, lien d'évitement.
 * Le script est idempotent : le relancer ne fait rien de plus.
 */
import { readFileSync, writeFileSync } from 'fs';

const DISCORD = 'https://discord.gg/aniimofr';
const POLICE = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap';

const CIBLES = [
  { fichier: 'aniimopedia/index.html', r: '../', actif: 'pedia' },
  { fichier: 'patch-notes/index.html', r: '../', actif: 'patch' },
  { fichier: 'patch-notes/2026-07-02-exemple.html', r: '../', actif: 'patch' },
];

function nav(r, actif) {
  const liens = [
    ['', 'Accueil', 'accueil'],
    ['aniimo/', 'Le jeu', 'jeu'],
    ['guides/', 'Guides', 'guides'],
    ['codes/', 'Codes', 'codes'],
    ['patch-notes/', 'Patch notes', 'patch'],
    ['aniimopedia/', 'Aniimopédia', 'pedia'],
  ];
  return `      <nav class="nav-liens" aria-label="Navigation principale">
${liens.map(([h, t, c]) => `        <a href="${r}${h}"${c === actif ? ' class="actif" aria-current="page"' : ''}>${t}</a>`).join('\n')}
        <a class="nav-cta" href="${DISCORD}" rel="noopener">Rejoindre</a>
      </nav>`;
}

function pied(r) {
  return `  <footer>
    <div class="footer-grille">
      <div class="footer-col">
        <div class="titre-col">Le jeu</div>
        <ul>
          <li><a href="${r}aniimo/">Fiche Aniimo</a></li>
          <li><a href="${r}aniimopedia/">Aniimopédia FR</a></li>
          <li><a href="${r}patch-notes/">Patch notes FR</a></li>
          <li><a href="${r}codes/">Codes Aniimo</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <div class="titre-col">Guides</div>
        <ul>
          <li><a href="${r}guides/">Tous les guides</a></li>
          <li><a href="${r}guides/bien-debuter/">Bien débuter</a></li>
          <li><a href="${r}guides/types-et-faiblesses/">Types et faiblesses</a></li>
          <li><a href="${r}guides/capture-anipod/">Capturer un Aniimo</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <div class="titre-col">Communauté</div>
        <ul>
          <li><a href="${DISCORD}" rel="noopener">Discord Aniimo France</a></li>
          <li><a href="${r}a-propos/">À propos</a></li>
          <li><a href="${r}mentions-legales/">Mentions légales</a></li>
        </ul>
      </div>
    </div>
    <p class="mention">Aniimo France est un serveur communautaire non officiel, créé par des fans. Il n'est affilié ni à Pawprint Studio, ni à Kingsglory. «&nbsp;Aniimo&nbsp;» est une marque de ses ayants droit respectifs.</p>
    <p>© 2026 Aniimo France · <a href="${DISCORD}" rel="noopener">Rejoindre le Discord</a></p>
  </footer>`;
}

for (const { fichier, r, actif } of CIBLES) {
  let s = readFileSync(fichier, 'utf8');
  const avant = s;
  const canonique = (s.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];

  // 1) hreflang + directives d'extrait, juste après la canonique
  if (canonique && !s.includes('hreflang')) {
    s = s.replace(
      /(<link rel="canonical" href="[^"]+">)/,
      `$1\n  <link rel="alternate" hreflang="fr" href="${canonique}">\n  <link rel="alternate" hreflang="x-default" href="${canonique}">`
    );
  }
  s = s.replace(
    '<meta name="robots" content="index, follow">',
    '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">\n  <meta name="author" content="Aniimo France">'
  );

  // 2) Image Open Graph optimisée + dimensions + carte Twitter
  s = s.replace(/https:\/\/aniimo-france\.fr\/banniere\.png/g, 'https://aniimo-france.fr/assets/og/banniere.jpg');
  if (!s.includes('og:image:width')) {
    s = s.replace(
      /(<meta property="og:image" content="[^"]+">)/,
      '$1\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta property="og:image:alt" content="Aniimo France — la communauté française du jeu Aniimo">'
    );
  }
  if (!s.includes('twitter:card')) {
    const t = (s.match(/<meta property="og:title" content="([^"]*)"/) || [])[1] || '';
    const d = (s.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
    s = s.replace(
      /(<meta property="og:image:alt"[^>]*>)/,
      `$1\n\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:title" content="${t}">\n  <meta name="twitter:description" content="${d}">\n  <meta name="twitter:image" content="https://aniimo-france.fr/assets/og/banniere.jpg">`
    );
  }

  // 3) Icônes et manifeste
  if (!s.includes('apple-touch-icon')) {
    s = s.replace(
      /(<link rel="icon"[^>]*>)/,
      `$1\n  <link rel="apple-touch-icon" href="${r}apple-touch-icon.png">\n  <link rel="manifest" href="${r}site.webmanifest">`
    );
  }

  // 4) Polices : suppression du blocage de rendu
  s = s.replace(
    `  <link href="${POLICE}" rel="stylesheet">\n`,
    `  <link rel="stylesheet" href="${POLICE}" media="print" onload="this.media='all'">\n  <noscript><link rel="stylesheet" href="${POLICE}"></noscript>\n`
  );

  // 5) Lien d'évitement + <main> identifiable
  if (!s.includes('saut-contenu')) {
    s = s.replace('<body>\n', '<body>\n  <a class="saut-contenu" href="#contenu">Aller au contenu</a>\n');
  }
  s = s.replace('  <main>', '  <main id="contenu">');

  // 6) Navigation et pied de page communs
  s = s.replace(/ {6}<nav class="nav-liens"[\s\S]*?<\/nav>/, nav(r, actif));
  s = s.replace(/ {2}<footer>[\s\S]*?<\/footer>/, pied(r));

  writeFileSync(fichier, s, 'utf8');
  console.log((s === avant ? '  = ' : '  ✓ ') + fichier);
}
console.log('\nPages historiques alignées.');
