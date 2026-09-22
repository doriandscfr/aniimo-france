/**
 * seo.mjs — Outil SEO du site aniimo-france.fr
 *
 *   node tools/seo.mjs
 *
 * Fait trois choses, à relancer après chaque ajout de page :
 *   1. AUDIT   — vérifie que chaque page a un title, une description,
 *                une canonique, les balises Open Graph et un seul <h1>.
 *   2. SITEMAP — régénère sitemap.xml à partir des pages réellement
 *                présentes sur le disque (plus d'oubli possible).
 *   3. LLMS    — régénère llms.txt, le plan du site destiné aux moteurs
 *                de réponse (ChatGPT, Claude, Perplexity, Gemini).
 *
 * La date `lastmod` vient du dernier commit Git touchant le fichier,
 * avec repli sur la date de modification du fichier.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { join, relative, sep } from 'path';

const SITE = 'https://aniimo-france.fr';
const RACINE = process.cwd();
const IGNORE = new Set(['node_modules', '.git', 'tools', 'assets']);

/* ---------- Priorités et fréquences par section ---------- */
const REGLES = [
  { test: (u) => u === '/',                    priorite: '1.0', freq: 'daily' },
  { test: (u) => u === '/codes/',              priorite: '0.9', freq: 'daily' },
  { test: (u) => u === '/aniimo/mobile/',      priorite: '0.9', freq: 'daily' },
  { test: (u) => u === '/aniimo/',             priorite: '0.9', freq: 'weekly' },
  { test: (u) => u === '/aniimopedia/',        priorite: '0.9', freq: 'weekly' },
  { test: (u) => u === '/patch-notes/',        priorite: '0.9', freq: 'weekly' },
  { test: (u) => u === '/guides/',             priorite: '0.8', freq: 'weekly' },
  { test: (u) => u.startsWith('/guides/'),     priorite: '0.8', freq: 'monthly' },
  { test: (u) => u.startsWith('/patch-notes/'),priorite: '0.7', freq: 'monthly' },
  { test: (u) => u.startsWith('/aniimopedia/'),priorite: '0.6', freq: 'monthly' },
  { test: () => true,                          priorite: '0.4', freq: 'yearly' },
];
const regle = (u) => REGLES.find((r) => r.test(u));

/* ---------- Parcours des fichiers HTML ---------- */
function html(dir = RACINE, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || IGNORE.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) html(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

/* ---------- Date de dernière modification ---------- */
function derniereMaj(fichier) {
  const rel = relative(RACINE, fichier).split(sep).join('/');
  try {
    const d = execSync(`git log -1 --format=%cs -- "${rel}"`, {
      cwd: RACINE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (d) return d;
  } catch { /* pas de dépôt Git, ou fichier jamais commité */ }
  return statSync(fichier).mtime.toISOString().slice(0, 10);
}

/* ---------- Extraction des métadonnées ---------- */
const capture = (src, re) => { const m = src.match(re); return m ? m[1].trim() : null; };

function lire(fichier) {
  const src = readFileSync(fichier, 'utf8');
  const rel = relative(RACINE, fichier).split(sep).join('/');
  const url = '/' + rel.replace(/(^|\/)index\.html$/, '$1');
  return {
    fichier: rel,
    url,
    canonique: capture(src, /<link rel="canonical" href="([^"]+)"/i),
    titre: capture(src, /<title>([^<]*)<\/title>/i),
    description: capture(src, /<meta name="description" content="([^"]*)"/i),
    ogTitre: capture(src, /<meta property="og:title" content="([^"]*)"/i),
    ogImage: capture(src, /<meta property="og:image" content="([^"]*)"/i),
    robots: capture(src, /<meta name="robots" content="([^"]*)"/i) || '',
    h1: (src.match(/<h1[\s>]/gi) || []).length,
    ld: (src.match(/application\/ld\+json/gi) || []).length,
    maj: derniereMaj(fichier),
  };
}

/* ---------- 1. Audit ---------- */
function audit(pages) {
  const problemes = [];
  const titresVus = new Map();
  const descVues = new Map();

  for (const p of pages) {
    const noindex = /noindex/i.test(p.robots);
    const ou = (m) => problemes.push(`${p.fichier} — ${m}`);

    if (!p.titre) ou('pas de <title>');
    else if (p.titre.length > 65) ou(`<title> trop long (${p.titre.length} car., viser ≤ 60)`);
    else if (p.titre.length < 25) ou(`<title> très court (${p.titre.length} car.)`);

    if (!p.description) ou('pas de meta description');
    else if (p.description.length > 165) ou(`description trop longue (${p.description.length} car., viser ≤ 160)`);
    else if (p.description.length < 70) ou(`description très courte (${p.description.length} car.)`);

    if (!noindex && !p.canonique) ou('pas de <link rel="canonical">');
    if (!noindex && p.canonique && p.canonique !== SITE + p.url) {
      ou(`canonique incohérente : ${p.canonique} ≠ ${SITE + p.url}`);
    }
    if (!p.ogTitre) ou('pas de og:title');
    if (!p.ogImage) ou('pas de og:image');
    if (p.h1 === 0) ou('aucun <h1>');
    if (p.h1 > 1) ou(`${p.h1} balises <h1> (il en faut exactement une)`);
    if (!noindex && p.ld === 0) ou('aucune donnée structurée JSON-LD');

    if (!noindex && p.titre) {
      if (titresVus.has(p.titre)) ou(`<title> identique à ${titresVus.get(p.titre)}`);
      else titresVus.set(p.titre, p.fichier);
    }
    if (!noindex && p.description) {
      if (descVues.has(p.description)) ou(`description identique à ${descVues.get(p.description)}`);
      else descVues.set(p.description, p.fichier);
    }
  }
  return problemes;
}

/* ---------- 2. Sitemap ---------- */
function sitemap(pages) {
  const indexables = pages
    .filter((p) => !/noindex/i.test(p.robots))
    .sort((a, b) => {
      const d = parseFloat(regle(b.url).priorite) - parseFloat(regle(a.url).priorite);
      return d !== 0 ? d : a.url.localeCompare(b.url);
    });

  const urls = indexables.map((p) => {
    const r = regle(p.url);
    const img = p.ogImage
      ? `\n    <image:image>\n      <image:loc>${p.ogImage}</image:loc>\n      <image:title>${
          (p.ogTitre || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
        }</image:title>\n    </image:image>`
      : '';
    return `  <url>
    <loc>${SITE}${p.url}</loc>
    <lastmod>${p.maj}</lastmod>
    <changefreq>${r.freq}</changefreq>
    <priority>${r.priorite}</priority>${img}
  </url>`;
  }).join('\n');

  writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- Généré par tools/seo.mjs — ne pas modifier à la main, relancer le script. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`, 'utf8');

  return indexables;
}

/* ---------- 3. llms.txt ---------- */
function llms(pages) {
  const groupes = [
    { titre: 'Le jeu Aniimo', filtre: (u) => u.startsWith('/aniimo/') || u === '/codes/' },
    { titre: 'Guides', filtre: (u) => u.startsWith('/guides/') },
    { titre: 'Base de données des créatures', filtre: (u) => u.startsWith('/aniimopedia/') },
    { titre: 'Mises à jour du jeu', filtre: (u) => u.startsWith('/patch-notes/') },
    { titre: 'La communauté', filtre: (u) => u === '/' || u === '/a-propos/' || u === '/mentions-legales/' },
  ];

  const bloc = (g) => {
    const l = pages.filter((p) => g.filtre(p.url));
    if (!l.length) return '';
    const lignes = l.map((p) => {
      const t = (p.ogTitre || p.titre || '').split('—')[0].split('|')[0].trim();
      return `- [${t}](${SITE}${p.url}): ${p.description || ''}`;
    }).join('\n');
    return `\n## ${g.titre}\n\n${lignes}\n`;
  };

  writeFileSync('llms.txt', `# Aniimo France

> Aniimo France est la communauté francophone non officielle du jeu Aniimo,
> un action-RPG free-to-play en monde ouvert de capture de créatures développé
> par Pawprint Studio, sorti le 16 septembre 2026 sur PC, PlayStation 5 et
> Xbox Series X|S, et le 23 septembre 2026 sur iOS et Android.
> Le site publie en français : la fiche du jeu, des guides, une base de données
> des créatures (Aniimopédia), les patch notes traduits et les codes cadeaux.
> Il est rédigé et vérifié par des joueurs francophones, sans lien avec l'éditeur.

Serveur Discord de la communauté : ${'https://discord.gg/aniimofr'}
Langue : français (fr-FR)
Licence du contenu rédactionnel : reprise autorisée avec mention de la source et lien.
${groupes.map(bloc).join('')}
## Informations de référence sur Aniimo

- Développeur : Pawprint Studio (Hangzhou), financé par FunPlus
- Éditeur : Pawprint Interactive Entertainment (anciennement label Kingsglory)
- Sortie PC, PS5, Xbox Series X|S : 16 septembre 2026
- Sortie iOS et Android : 23 septembre 2026 (Europe : 02:00 UTC, soit 04:00 heure de Paris ; pré-téléchargement ouvert depuis le 21 septembre au soir)
- Mobile : 18 Go d'espace libre requis, 60 IPS sur la plupart des appareils, optimisation tablette
- Mobile minimum : iPhone 11 (A13) sous iOS 16 avec 4 Go de RAM, ou Snapdragon 855 / Dimensity 1000 sous Android 10 avec 6 Go de RAM et Vulkan 1.1
- Mobile recommandé : iPhone 14 Pro (A16) avec 6 Go de RAM, ou Snapdragon 8 Gen 2 / Dimensity 9200 avec 8 Go de RAM
- Modèle économique : free-to-play, achats optionnels, ce n'est pas un gacha
- Monde : le continent d'Idyll
- Créatures : plus de 200 au lancement
- Éléments : Feu, Eau, Plante, Foudre, Glace, Terre, Vent, Lumière, Ténèbres
- Multiplicateurs de dégâts : 1,6 (super efficace), 1 (neutre), 0,625 (résisté), aucune immunité
- Mécanique signature : le Tissage (Twining), fusion avec une créature capturée
- Capture : Anipods (standard, Pro, Mega, Ultra) et jauge de Rupture
- Crossplay et cross-progression : oui, via le compte Aniimo Pass, au sein d'un même serveur régional
`, 'utf8');
}

/* ---------- Exécution ---------- */
const pages = html().map(lire);
const problemes = audit(pages);
const indexables = sitemap(pages);
llms(indexables);

console.log(`\nSITEMAP  ${indexables.length} URL écrites dans sitemap.xml`);
console.log(`LLMS     llms.txt régénéré`);
console.log(`AUDIT    ${pages.length} pages analysées`);
if (problemes.length) {
  console.log(`\n${problemes.length} point(s) à corriger :`);
  for (const p of problemes) console.log('  • ' + p);
} else {
  console.log('\nAucun problème détecté.');
}
