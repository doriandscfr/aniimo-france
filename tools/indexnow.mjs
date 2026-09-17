/**
 * indexnow.mjs — Signale les URL modifiées aux moteurs, sans attendre le crawl.
 *
 *   node tools/indexnow.mjs              → soumet toutes les URL du sitemap
 *   node tools/indexnow.mjs /codes/      → soumet uniquement ces URL
 *
 * IndexNow est un protocole commun à Bing, Yandex, Seznam et Naver : une seule
 * requête prévient tous les moteurs participants, en général indexés en quelques
 * heures au lieu de plusieurs jours.
 *
 * Google ne participe PAS à IndexNow. Pour Google, il faut passer par la Search
 * Console (Inspection d'URL → « Demander une indexation »), ou attendre le
 * passage naturel du robot — le sitemap et les liens internes s'en chargent.
 *
 * La clé est le fichier <clé>.txt à la racine du site : il doit rester en ligne,
 * c'est lui qui prouve aux moteurs que le domaine nous appartient.
 */
import { readFileSync, readdirSync } from 'fs';

const HOTE = 'aniimo-france.fr';
const SITE = 'https://' + HOTE;

/* ---------- Retrouve la clé posée à la racine ---------- */
const fichierCle = readdirSync('.').find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!fichierCle) {
  console.error('Aucun fichier de clé IndexNow (<32 caractères hexadécimaux>.txt) à la racine.');
  console.error('Générez-en un :');
  console.error('  node -e "const c=require(\'crypto\').randomBytes(16).toString(\'hex\');'
    + 'require(\'fs\').writeFileSync(c+\'.txt\',c);console.log(c)"');
  process.exit(1);
}
const cle = fichierCle.replace('.txt', '');

/* ---------- Liste des URL à soumettre ---------- */
let urls = process.argv.slice(2).map((u) => (u.startsWith('http') ? u : SITE + (u.startsWith('/') ? u : '/' + u)));

if (!urls.length) {
  const sitemap = readFileSync('sitemap.xml', 'utf8');
  urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
if (!urls.length) {
  console.error('Aucune URL à soumettre.');
  process.exit(1);
}

console.log(`Clé   : ${cle}`);
console.log(`Hôte  : ${HOTE}`);
console.log(`URL   : ${urls.length}`);
urls.forEach((u) => console.log('        ' + u));

/* ---------- Soumission ---------- */
const reponse = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOTE,
    key: cle,
    keyLocation: `${SITE}/${fichierCle}`,
    urlList: urls,
  }),
});

const corps = await reponse.text();
console.log(`\nRéponse : ${reponse.status} ${reponse.statusText}`);
if (corps) console.log(corps);

// 200 = accepté, 202 = accepté mais clé en cours de vérification.
if (reponse.status === 200 || reponse.status === 202) {
  console.log('\nURL soumises. Le fichier de clé doit rester accessible en ligne.');
} else {
  console.log('\nÉchec. Vérifiez que https://' + HOTE + '/' + fichierCle + ' est bien en ligne.');
  process.exit(1);
}
