/**
 * veille.mjs — Surveille les actualités du site officiel d'Aniimo.
 *
 *   node tools/veille.mjs            → signale les nouveautés
 *   node tools/veille.mjs --ecrire   → crée aussi un brouillon par nouveauté
 *
 * COMMENT ÇA MARCHE
 * Le site officiel ne publie pas de flux RSS et sa liste d'actualités est
 * rendue en JavaScript. En revanche, son sitemap par langue est accessible
 * et son robots.txt autorise explicitement /fr/. On compare donc le sitemap
 * à la liste des articles déjà vus (data/actus-connues.json).
 *
 * CE QUE ÇA RÉCUPÈRE
 * Le titre et la date, présents dans le HTML servi. Le corps de l'article
 * est chargé par une requête XHR après affichage : il n'est pas récupérable
 * sans navigateur sans interface, d'où le lien vers la source dans chaque
 * brouillon.
 *
 * LA TRADUCTION N'EST PAS LE SUJET
 * L'éditeur publie déjà ses actualités en français sur /fr/ — titres et
 * corps. Seuls les tout derniers articles paraissent parfois en anglais,
 * le temps que la version française soit mise en ligne.
 *
 * CE QUE ÇA NE FAIT PAS, VOLONTAIREMENT
 * Publier directement. Un brouillon est créé en noindex, à relire et à
 * compléter avant mise en ligne. Trois raisons :
 *   • la version française officielle existe déjà : la recopier produit du
 *     contenu strictement dupliqué, que Google n'a aucune raison de classer
 *     devant la source, et qui expose juridiquement ;
 *   • la page « À propos » du site promet « pas de traduction automatique,
 *     tout est rédigé en français par des joueurs » ;
 *   • Google sanctionne la republication massive sans valeur ajoutée.
 *
 * La valeur ajoutée du site est ailleurs, et elle est réelle : résumer en
 * format court, mettre en forme avec les composants de patch note, et SURTOUT
 * lier chaque créature et chaque élément cités vers les fiches du site.
 * Ça, le site officiel ne le fera jamais.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const SITEMAP = 'https://www.aniimo.com/__sitemap__/fr-FR.xml';
const ETAT = 'data/actus-connues.json';
const BROUILLONS = 'patch-notes/_brouillons';
const ecrire = process.argv.includes('--ecrire');

const UA = 'Mozilla/5.0 (compatible; AniimoFranceBot/1.0; +https://aniimo-france.fr/a-propos/)';

/* ---------- 1. Les articles publiés côté officiel ---------- */
async function articlesOfficiels() {
  const xml = await fetch(SITEMAP, { headers: { 'User-Agent': UA } }).then((r) => r.text());
  const ids = new Set();
  for (const m of xml.matchAll(/newslist\/detail\/(\d+)/g)) ids.add(m[1]);
  // Les variantes /m/ (mobile) pointent le même article : on dédoublonne par identifiant.
  return [...ids].sort((a, b) => Number(a) - Number(b));
}

/* ---------- 2. Métadonnées d'un article ---------- */
async function lireArticle(id) {
  const url = `https://www.aniimo.com/fr/newslist/detail/${id}`;
  const html = await fetch(url, { headers: { 'User-Agent': UA } }).then((r) => r.text());

  const titre = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const date = (html.match(/(20\d{2}-\d{2}-\d{2})/) || [])[1] || '';

  return {
    id,
    url,
    // Le titre de page se termine par « | aniimo » : on le retire.
    titre: titre.replace(/\s*\|\s*aniimo\s*$/i, '').replace(/&#x27;/g, "'").trim(),
    date,
  };
}

/* ---------- 3. Brouillon prêt à compléter ---------- */
function brouillon(a) {
  const nom = `${a.date || 'date-inconnue'}-${a.id}`;
  return { nom, contenu: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- ============================================================
       BROUILLON AUTOMATIQUE — ne pas publier tel quel.

       Détecté le ${new Date().toISOString().slice(0, 10)} sur le site officiel.

       Le titre ci-dessous est celui de l'éditeur. L'article officiel est en
       principe déjà en français ; s'il est encore en anglais, c'est que la
       version française n'est pas encore en ligne — repassez plus tard.

       NE RECOPIEZ PAS l'article : la version française officielle existe,
       la dupliquer ne vous apporterait rien et vous exposerait. RÉSUMEZ
       avec vos mots, puis liez les créatures et les éléments cités vers
       vos propres fiches. C'est ça, votre valeur ajoutée.

       Quand la note est prête :
         1. déplacez ce fichier dans patch-notes/ avec un nom parlant
            (ex. 2026-10-16-saison-1-partie-2.html) ;
         2. remplacez la balise robots par « index, follow » ;
         3. ajoutez l'entrée dans patch-notes/index.html ;
         4. lancez « npm run build » puis « npm run controle ».
       ============================================================ -->
  <title>BROUILLON — ${a.titre}</title>
  <meta name="description" content="À RÉDIGER : résumé en français de la mise à jour, 140 à 160 caractères.">
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#0B1230">
  <link rel="icon" type="image/png" href="../../favicon.png">
  <link rel="stylesheet" href="../../assets/site.css">
</head>
<body>
  <main id="contenu" class="article">
    <h1>BROUILLON — ${a.titre}</h1>

    <p class="chapo">Publié le ${a.date || '(date à vérifier)'} par l'éditeur.</p>

    <h2>Source</h2>
    <p><a href="${a.url}" rel="noopener nofollow">Lire l'article officiel</a></p>

    <h2>À faire</h2>
    <ol>
      <li>Lire l'article officiel et <strong>résumer</strong> les points marquants avec vos mots — ne pas recopier.</li>
      <li>Reformuler le titre dans le style du site.</li>
      <li>Mettre en forme avec les composants de patch note : <code>chip-buff</code>, <code>chip-nerf</code>, <code>carte-crea</code>, <code>diff</code>.</li>
      <li><strong>Lier chaque créature citée</strong> vers sa fiche, par exemple <code>/aniimopedia/scorchhowl/</code>.</li>
      <li><strong>Lier chaque élément cité</strong> vers <code>/guides/types-et-faiblesses/&lt;élément&gt;/</code>.</li>
      <li>Si un code cadeau est annoncé, l'ajouter dans <code>tools/pages-codes.mjs</code>.</li>
    </ol>
  </main>
</body>
</html>
` };
}

/* ---------- Exécution ---------- */
const connues = existsSync(ETAT)
  ? JSON.parse(readFileSync(ETAT, 'utf8'))
  : { miseAJour: null, ids: [] };

const officiels = await articlesOfficiels();
const nouveaux = officiels.filter((id) => !connues.ids.includes(id));

console.log(`Articles côté officiel : ${officiels.length}`);
console.log(`Déjà connus            : ${connues.ids.length}`);
console.log(`Nouveaux               : ${nouveaux.length}`);

if (!nouveaux.length) {
  console.log('\nRien de neuf.');
  process.exit(0);
}

console.log('');
const fiches = [];
for (const id of nouveaux) {
  try {
    const a = await lireArticle(id);
    fiches.push(a);
    console.log(`  • [${a.date || '????-??-??'}] ${a.titre}`);
    console.log(`    ${a.url}`);
    if (ecrire) {
      mkdirSync(BROUILLONS, { recursive: true });
      const b = brouillon(a);
      const chemin = `${BROUILLONS}/${b.nom}.html`;
      if (!existsSync(chemin)) {
        writeFileSync(chemin, b.contenu, 'utf8');
        console.log(`    → brouillon : ${chemin}`);
      }
    }
  } catch (e) {
    console.log(`  ! article ${id} illisible : ${e.message}`);
  }
}

if (ecrire) {
  mkdirSync('data', { recursive: true });
  writeFileSync(ETAT, JSON.stringify({
    _lisezMoi: 'Identifiants des actualités officielles déjà repérées par tools/veille.mjs. '
      + 'Supprimer une entrée fait réapparaître l\'article comme nouveau.',
    miseAJour: new Date().toISOString().slice(0, 10),
    ids: officiels,
  }, null, 2) + '\n', 'utf8');
  console.log(`\nÉtat enregistré : ${ETAT}`);
} else {
  console.log('\n(Relancez avec --ecrire pour créer les brouillons et mémoriser ces articles.)');
}

// Code de sortie 10 : « il y a du nouveau », exploité par l'automatisation.
process.exit(10);
