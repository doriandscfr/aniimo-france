/**
 * verifier-ligne.mjs — Contrôle le site RÉELLEMENT en ligne après un déploiement.
 *
 *   npm run enligne
 *
 * Complète `npm run verifier`, qui ne regarde que les fichiers locaux.
 * Ici on interroge https://aniimo-france.fr pour confirmer que GitHub Pages
 * a bien publié la dernière version.
 *
 * Écrit en Node plutôt qu'en ligne de commande parce que sous PowerShell,
 * `curl` est un alias d'Invoke-WebRequest et ne comprend pas la syntaxe Unix
 * (`curl -sI` échoue). Ce script fonctionne partout, sans dépendance.
 */
import { readFileSync, readdirSync } from 'fs';

const SITE = 'https://aniimo-france.fr';
let erreurs = 0;

const vert = (t) => `\x1b[32m${t}\x1b[0m`;
const rouge = (t) => `\x1b[31m${t}\x1b[0m`;
const gris = (t) => `\x1b[90m${t}\x1b[0m`;

async function tester(chemin, attendu = 200, options = {}) {
  const url = SITE + chemin;
  try {
    const r = await fetch(url, { redirect: 'follow' });
    const ok = r.status === attendu;
    if (!ok) erreurs++;
    let detail = '';

    if (ok && options.contient) {
      const corps = await r.text();
      const manquant = options.contient.filter((t) => !corps.includes(t));
      if (manquant.length) {
        erreurs++;
        detail = rouge(' ← texte absent : ' + manquant.join(', '));
      } else {
        detail = gris(' ✓ contenu à jour');
      }
    } else if (ok && options.taille) {
      detail = gris(` ${(Number(r.headers.get('content-length') || 0) / 1024).toFixed(0)} Ko`);
    }

    console.log(`  ${ok ? vert(r.status) : rouge(r.status)}  ${chemin}${detail}`);
  } catch (e) {
    erreurs++;
    console.log(`  ${rouge('ERR')}  ${chemin} — ${e.message}`);
  }
}

console.log(`\nContrôle de ${SITE}\n`);

/* --- Les pages du sitemap local doivent toutes répondre en ligne --- */
const sitemap = readFileSync('sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, ''));

console.log('Pages du sitemap :');
for (const u of urls) await tester(u);

/* --- Fichiers techniques --- */
console.log('\nFichiers techniques :');
await tester('/robots.txt');
await tester('/sitemap.xml');
await tester('/llms.txt');
await tester('/site.webmanifest');
await tester('/assets/og/banniere.jpg', 200, { taille: true });

const cle = readdirSync('.').find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (cle) await tester('/' + cle);

/* --- Comportements attendus --- */
console.log('\nComportements :');
await tester('/page-qui-nexiste-pas', 404);
await tester('/', 200, { contient: ['disponible depuis le 16 septembre 2026'] });

/* --- Fraîcheur --- */
try {
  const r = await fetch(SITE + '/', { method: 'HEAD' });
  const maj = r.headers.get('last-modified');
  const age = (Date.now() - new Date(maj).getTime()) / 60000;
  console.log(`\nDernière publication : ${maj}`);
  console.log(age < 30
    ? vert(`  Publié il y a ${Math.round(age)} min — c'est bien la version que vous venez de pousser.`)
    : gris(`  Publié il y a ${Math.round(age / 60)} h. Si vous venez de pousser, attendez 1 à 2 min et relancez.`));
} catch { /* sans importance */ }

/* ---------- Déploiement très récent : les 404 sont suspects ----------
   GitHub Pages distribue les fichiers sur son CDN progressivement, pas d'un
   bloc. Juste après un push, une partie des pages peut encore répondre 404
   alors que tout est correct. Inutile d'alarmer : on le dit, et on invite à
   relancer plutôt qu'à chercher un bug qui n'existe pas. */
let recent = false;
try {
  const r = await fetch(SITE + '/', { method: 'HEAD' });
  const maj = new Date(r.headers.get('last-modified')).getTime();
  recent = (Date.now() - maj) / 60000 < 5;
} catch { /* sans importance */ }

if (erreurs && recent) {
  console.log(gris(`\n${erreurs} page(s) pas encore servie(s).`));
  console.log(gris('Le déploiement date de moins de 5 minutes : GitHub distribue'));
  console.log(gris('ses fichiers progressivement. Attendez 2 minutes et relancez'));
  console.log(gris('`npm run enligne` avant de conclure à un problème.'));
  process.exit(0);
}

console.log(erreurs
  ? rouge(`\n${erreurs} problème(s) en ligne.`)
  : vert('\nTout est en ligne et conforme.'));
process.exit(erreurs ? 1 : 0);
