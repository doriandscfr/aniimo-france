/**
 * patch-notes-seo.mjs — Données structurées de la section Patch notes.
 *
 *   node tools/patch-notes-seo.mjs
 *
 * Lit la liste des notes dans patch-notes/index.html, puis :
 *   • injecte un CollectionPage + ItemList dans la page de liste ;
 *   • injecte un NewsArticle + BreadcrumbList dans chaque note.
 *
 * À relancer après avoir publié une nouvelle note. Idempotent.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const SITE = 'https://aniimo-france.fr';

const MARQUEUR = '<!-- JSON-LD généré par tools/patch-notes-seo.mjs -->';

/**
 * Insère (ou remplace) un bloc JSON-LD avant le <link rel="icon">.
 * Les blocs posés par ce script portent un marqueur et sont donc
 * régénérables ; un JSON-LD écrit à la main est laissé intact.
 */
function injecter(fichier, objet) {
  let s = readFileSync(fichier, 'utf8');

  if (s.includes('application/ld+json') && !s.includes(MARQUEUR)) {
    console.log('  = ' + fichier + ' (JSON-LD manuel, laissé tel quel)');
    return false;
  }
  // Retrait de la version précédemment générée, le cas échéant.
  s = s.replace(
    /[ \t]*<!-- JSON-LD généré par tools\/patch-notes-seo\.mjs -->\n[\s\S]*?<\/script>\n\n/,
    ''
  );

  const ld = '  ' + MARQUEUR + '\n  <script type="application/ld+json">\n'
    + JSON.stringify(objet, null, 2).split('\n').map((l) => '  ' + l).join('\n')
    + '\n  </script>\n\n';
  s = s.replace(/(  <link rel="icon")/, ld + '$1');
  writeFileSync(fichier, s, 'utf8');
  console.log('  ✓ ' + fichier);
  return true;
}

/* ---------- Lecture de la liste des notes ---------- */
const liste = readFileSync('patch-notes/index.html', 'utf8');
// Dans le gabarit, la date est portée par le chip « chip-version ».
const notes = [...liste.matchAll(
  /<a class="note-item"[^>]*href="([^"]+)"[\s\S]*?class="note-version">([^<]*)<[\s\S]*?class="chip chip-version">([^<]*)<[\s\S]*?class="note-titre">([^<]*)</g
)].map((m) => ({
  href: m[1], version: m[2].trim(), date: m[3].trim(), titre: m[4].trim(),
}));

console.log(`${notes.length} note(s) détectée(s) dans la liste.\n`);

/* ---------- Page de liste ---------- */
injecter('patch-notes/index.html', {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': SITE + '/patch-notes/#page',
      name: 'Patch notes Aniimo en français',
      description: "Toutes les mises à jour d'Aniimo traduites et résumées en français par la communauté Aniimo France.",
      url: SITE + '/patch-notes/',
      inLanguage: 'fr-FR',
      isPartOf: { '@id': SITE + '/#site' },
      about: { '@id': SITE + '/#jeu' },
      publisher: { '@id': SITE + '/#organisation' },
      primaryImageOfPage: SITE + '/assets/og/banniere.jpg',
      mainEntity: {
        '@type': 'ItemList',
        name: "Patch notes d'Aniimo traduits en français",
        numberOfItems: notes.length,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: notes.map((n, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${n.version} — ${n.titre}`,
          url: SITE + '/patch-notes/' + n.href.replace(/^\.\//, ''),
        })),
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Patch notes', item: SITE + '/patch-notes/' },
      ],
    },
  ],
});

/* ---------- Chaque note ---------- */
for (const n of notes) {
  const fichier = 'patch-notes/' + n.href.replace(/^\.\//, '');
  if (!existsSync(fichier)) { console.log('  ! fichier absent : ' + fichier); continue; }

  const src = readFileSync(fichier, 'utf8');
  const url = (src.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || SITE + '/' + fichier;
  const titre = (src.match(/<title>([^<]*)<\/title>/) || [])[1] || n.titre;
  const desc = (src.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  // Le nom de fichier porte la date de publication : AAAA-MM-JJ-…
  const iso = (fichier.match(/(\d{4}-\d{2}-\d{2})/) || [])[1] || '2026-01-01';

  injecter(fichier, {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        headline: titre,
        description: desc,
        url,
        mainEntityOfPage: url,
        inLanguage: 'fr-FR',
        datePublished: iso,
        dateModified: iso,
        image: SITE + '/assets/og/banniere.jpg',
        articleSection: 'Patch notes',
        keywords: `patch note Aniimo, mise à jour Aniimo, Aniimo ${n.version}, équilibrage Aniimo`,
        author: { '@type': 'Organization', name: 'Aniimo France', url: SITE + '/' },
        publisher: { '@id': SITE + '/#organisation' },
        about: { '@id': SITE + '/#jeu' },
        isPartOf: { '@id': SITE + '/patch-notes/#page' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: 'Patch notes', item: SITE + '/patch-notes/' },
          { '@type': 'ListItem', position: 3, name: n.version || titre, item: url },
        ],
      },
    ],
  });
}
