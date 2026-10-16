/**
 * aniimopedia.mjs — Construit l'Aniimopédia depuis data/creatures.json.
 *
 *   node tools/aniimopedia.mjs   (ou npm run pedia)
 *
 * data/creatures.json est la SOURCE DE VÉRITÉ. Ce script en déduit :
 *   1. le tableau CREATURES injecté dans le JavaScript de la page ;
 *   2. la grille en HTML statique — sans elle, un robot qui n'exécute pas
 *      de JS ne verrait qu'un <div> vide et aucune créature ne serait
 *      indexable ;
 *   3. les filtres de type et de rôle, déduits des données réelles ;
 *   4. les données structurées CollectionPage + ItemList ;
 *   5. la balise robots : la page s'indexe dès qu'elle contient des données,
 *      et repasse en noindex si la base est vidée.
 *
 * Idempotent : relancer le script réécrit simplement la page à jour.
 */
import { readFileSync, writeFileSync } from 'fs';
import { slug as slugElement } from './elements.mjs';

const FICHIER = 'aniimopedia/index.html';
const SITE = 'https://aniimo-france.fr';
const DISCORD = 'https://discord.gg/aniimofr';

const base = JSON.parse(readFileSync('data/creatures.json', 'utf8'));
const CREATURES = base.creatures;
const pleine = CREATURES.length > 0;

/** Identifiant d'URL : « Little Fire Spirit » → « little-fire-spirit ». */
export const slugCrea = (nom) => nom.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const echap = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let s = readFileSync(FICHIER, 'utf8');

/* ---------- 1. Indexation ---------- */
s = s.replace(
  /(?:<!-- noindex temporaire[\s\S]*?-->\n {2})?<meta name="robots" content="[^"]*">/,
  pleine
    ? '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">'
    : '<!-- noindex : la base est vide. Repasse en "index, follow" dès qu\'elle\n       contient des données. -->\n  <meta name="robots" content="noindex, follow">'
);

/* ---------- 2. Bandeau ---------- */
const bandeau = pleine
  ? `    <div class="avis-construction">
      <div class="etiq">Base communautaire · ${base.total} créatures</div>
      <p><strong>${base.repartition.confirme} fiches sont confirmées</strong> par recoupement de deux index indépendants. Les ${base.repartition['source-unique']} restantes, signalées par un point d'interrogation, n'ont été vues que dans un seul relevé.</p>
      <p>Les <strong>statistiques chiffrées et les descriptions sont encore à relever</strong>, créature par créature, directement en jeu. Vous jouez et vous voulez aider&nbsp;?</p>
      <a class="bouton-discord" href="${DISCORD}" rel="noopener" style="margin-top:8px">Participer au relevé</a>
    </div>`
  : `    <div class="avis-construction">
      <div class="etiq">Base en cours de constitution</div>
      <p>Cette page ne contient pas encore de données. Le relevé se coordonne sur le Discord.</p>
      <a class="bouton-discord" href="${DISCORD}" rel="noopener" style="margin-top:8px">Participer au relevé</a>
    </div>`;

s = s.replace(/ {4}<div class="avis-construction">[\s\S]*?<\/div>\n\n/, bandeau + '\n\n');

/* ---------- 3. Les outils de filtrage redeviennent visibles ---------- */
s = s.replace(/ {4}<div style="display:none">\n {4}<\/div>\n\n/, '');

/* ---------- 4. Grille statique ---------- */
const carte = (c) => {
  const doute = c.confiance !== 'confirme';
  return `      <a class="crea" href="${slugCrea(c.nom)}/" style="--accent:var(--type-${slugElement(c.types[0])})">
        <div class="avatar">${c.image
          ? `<img src="images/${c.image}" alt="${echap(c.nom)}, Aniimo de type ${c.types.join(' et ')}" loading="lazy" width="96" height="96">`
          : c.emoji}</div>
        <h3>${echap(c.nom)}${doute ? '<span class="doute" title="Vu dans un seul relevé, à confirmer">?</span>' : ''}</h3>
        <div class="badges">
          ${c.types.map((t) => `<span class="type type-${slugElement(t)}">${t}</span>`).join('')}
          ${c.roles.map((r) => `<span class="role">${r}</span>`).join('')}
        </div>
      </a>`;
};

const grille = pleine
  ? `<h2 class="titre-grille">Les ${base.total} créatures d'Aniimo</h2>

    <div class="grille-crea" id="grille">
${CREATURES.map(carte).join('\n')}
    </div>`
  : `<div class="grille-crea" id="grille"></div>`;

s = s.replace(
  /(?:<h2 class="titre-grille">[\s\S]*?<\/h2>\s*)?<div class="grille-crea" id="grille">[\s\S]*?<\/div>\n {2}<\/main>/,
  grille + '\n  </main>'
);

/* ---------- 5. Données injectées dans le script ---------- */
const pourJs = CREATURES.map((c) => ({
  nom: c.nom, types: c.types, roles: c.roles, emoji: c.emoji,
  image: c.image, lien: slugCrea(c.nom) + '/',
  description: c.description || '', stats: c.stats || {},
  doute: c.confiance !== 'confirme',
}));

s = s.replace(
  /const CREATURES = \[[\s\S]*?\n {2}\];/,
  'const CREATURES = ' + JSON.stringify(pourJs, null, 2).split('\n').map((l, i) => (i ? '  ' + l : l)).join('\n') + ';'
);

/* ---------- 6. Filtres déduits des données ---------- */
const typesPresents = [...new Set(CREATURES.flatMap((c) => c.types))];
const rolesPresents = [...new Set(CREATURES.flatMap((c) => c.roles))];
const ordreTypes = ['Feu', 'Eau', 'Plante', 'Terre', 'Glace', 'Vent', 'Foudre', 'Ténèbres', 'Lumière'];
const ordreRoles = ['DPS', 'BREAK', 'SUPPORT', 'HEAL', 'REGEN'];
const trier = (l, ordre) => ordre.filter((x) => l.includes(x)).concat(l.filter((x) => !ordre.includes(x)));

s = s.replace(/const TYPES = \[[^\]]*\];/, 'const TYPES = ' + JSON.stringify(trier(typesPresents, ordreTypes)) + ';');
s = s.replace(
  /(?:\/\/ Rôles réels[\s\S]*?\n {2})?const ROLES = \[[^\]]*\];/,
  '// Rôles tels qu\'ils apparaissent dans le jeu.\n  const ROLES = ' + JSON.stringify(trier(rolesPresents, ordreRoles)) + ';'
);

/* ---------- 7. Styles propres aux nouveautés ---------- */
if (!s.includes('.crea .doute')) {
  s = s.replace('  </style>', `
    /* Les cartes sont devenues des liens vers la fiche de la créature. */
    a.crea{text-decoration:none;color:inherit;display:block}
    /* Marque les créatures vues dans un seul relevé. */
    .crea .doute{
      display:inline-block;margin-left:5px;width:15px;height:15px;line-height:15px;
      border-radius:50%;background:rgba(255,201,77,.18);border:1px solid rgba(255,201,77,.5);
      color:var(--or);font-size:.65rem;font-weight:800;text-align:center;vertical-align:middle;
    }
  </style>`);
}

/* ---------- 8. Données structurées ---------- */
const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': SITE + '/aniimopedia/#page',
      name: `Aniimopédia — les ${base.total} créatures d'Aniimo en français`,
      description: `La base de données communautaire des ${base.total} créatures du jeu Aniimo, en français : éléments, rôles et faiblesses.`,
      url: SITE + '/aniimopedia/',
      inLanguage: 'fr-FR',
      isPartOf: { '@id': SITE + '/#site' },
      about: { '@id': SITE + '/#jeu' },
      publisher: { '@id': SITE + '/#organisation' },
      primaryImageOfPage: SITE + '/assets/og/banniere.jpg',
      dateModified: base.miseAJour,
      mainEntity: {
        '@type': 'ItemList',
        name: 'Créatures d\'Aniimo',
        numberOfItems: CREATURES.length,
        itemListOrder: 'https://schema.org/ItemListUnordered',
        itemListElement: CREATURES.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.nom,
          url: `${SITE}/aniimopedia/${slugCrea(c.nom)}/`,
        })),
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Aniimopédia', item: SITE + '/aniimopedia/' },
      ],
    },
  ],
};
s = s.replace(
  /  <script type="application\/ld\+json">[\s\S]*?<\/script>\n\n/,
  '  <script type="application/ld+json">\n'
  + JSON.stringify(ld, null, 2).split('\n').map((l) => '  ' + l).join('\n')
  + '\n  </script>\n\n'
);

/* ---------- 9. Métadonnées de la page ---------- */
s = s.replace(/<title>[^<]*<\/title>/, `<title>Aniimopédia : les ${base.total} créatures d'Aniimo en français</title>`);
s = s.replace(
  /<meta name="description" content="[^"]*">/,
  `<meta name="description" content="La liste des ${base.total} créatures d'Aniimo en français : élément, rôle et faiblesses de chaque Aniimo, avec recherche et filtres par type et par rôle.">`
);
s = s.replace(
  /<meta property="og:title" content="[^"]*">/,
  `<meta property="og:title" content="Aniimopédia : les ${base.total} créatures d'Aniimo en français">`
);
s = s.replace(
  /(<h1><span class="souligne">)[^<]*(<\/span><\/h1>)/,
  `$1Aniimopédia$2`
);
s = s.replace(
  /(<div class="entete-page">[\s\S]*?<\/h1>\n {6}<p>)[^<]*(<\/p>)/,
  `$1Les ${base.total} créatures d'Idyll en français — élément, rôle et faiblesses de chaque Aniimo.$2`
);

/* ---------- 10. Le clic ouvre la fiche, le JS ne doit plus l'intercepter ---------- */
s = s.replace(
  /      el\.addEventListener\("click", \(\) => ouvrirFiche\(c\)\);\n/,
  ''
);
s = s.replace(
  /const el = document\.createElement\("article"\);/,
  'const el = document.createElement("a");\n      el.href = c.lien;'
);

writeFileSync(FICHIER, s, 'utf8');

console.log(`  ✓ ${CREATURES.length} créatures injectées (${base.repartition.confirme} confirmées)`);
console.log(`  ✓ filtres : ${trier(typesPresents, ordreTypes).length} types, ${trier(rolesPresents, ordreRoles).length} rôles`);
console.log(`  ✓ page ${pleine ? 'indexable' : 'en noindex (base vide)'}`);
