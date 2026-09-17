/**
 * verifier.mjs — Contrôles qui cassent le référencement s'ils échouent.
 *
 *   node tools/verifier.mjs
 *
 *   1. Chaque bloc JSON-LD est du JSON valide (un bloc invalide est
 *      silencieusement ignoré par Google : aucun résultat enrichi).
 *   2. Chaque lien interne pointe vers un fichier qui existe
 *      (un lien mort gaspille du budget de crawl et dégrade l'expérience).
 *   3. Chaque image locale référencée existe.
 *   4. Les ancres internes (#id) correspondent à un identifiant présent.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, dirname, resolve, relative, sep } from 'path';

const RACINE = process.cwd();
const IGNORE = new Set(['node_modules', '.git', 'tools', 'data']);
let erreurs = 0;
const signaler = (f, m) => { console.log(`  ✗ ${f} — ${m}`); erreurs++; };

function pagesHtml(dir = RACINE, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || IGNORE.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) pagesHtml(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

/** Résout une URL de page vers un fichier sur le disque. */
function cible(base, href) {
  let chemin = href.startsWith('/') ? join(RACINE, href) : resolve(dirname(base), href);
  if (existsSync(chemin) && statSync(chemin).isDirectory()) chemin = join(chemin, 'index.html');
  else if (!existsSync(chemin) && !/\.[a-z0-9]+$/i.test(href)) chemin = join(chemin, 'index.html');
  return chemin;
}

for (const fichier of pagesHtml()) {
  const rel = relative(RACINE, fichier).split(sep).join('/');
  const src = readFileSync(fichier, 'utf8');
  // Le balayage des liens et médias ignore le JavaScript : les gabarits
  // `images/${c.image}` qu'on y trouve ne sont pas des chemins réels.
  const horsScript = src.replace(/<script\b[\s\S]*?<\/script>/g, '');

  /* --- 1. JSON-LD --- */
  for (const m of src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const o = JSON.parse(m[1]);
      const noeuds = o['@graph'] || [o];
      for (const n of noeuds) {
        if (!n['@type']) signaler(rel, 'nœud JSON-LD sans @type');
      }
    } catch (e) {
      signaler(rel, 'JSON-LD invalide : ' + e.message);
    }
  }

  /* --- 2. Liens internes --- */
  for (const m of horsScript.matchAll(/<a[^>]+href="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:|#|data:)/.test(href)) continue;
    const c = cible(fichier, href.split('#')[0].split('?')[0]);
    if (!existsSync(c)) signaler(rel, `lien mort → ${href}`);
  }

  /* --- 3. Images et médias locaux --- */
  for (const m of horsScript.matchAll(/<(?:img|video|source)[^>]+src="([^"]+)"/g)) {
    const s2 = m[1];
    if (/^(https?:|data:)/.test(s2)) continue;
    const c = s2.startsWith('/') ? join(RACINE, s2) : resolve(dirname(fichier), s2);
    if (!existsSync(c)) signaler(rel, `média absent → ${s2}`);
  }
  for (const m of horsScript.matchAll(/poster="([^"]+)"/g)) {
    const c = resolve(dirname(fichier), m[1]);
    if (!existsSync(c)) signaler(rel, `poster absent → ${m[1]}`);
  }

  /* --- 4. Ancres internes --- */
  const ids = new Set([...horsScript.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of horsScript.matchAll(/<a[^>]+href="#([^"]+)"/g)) {
    if (m[1] && !ids.has(m[1])) signaler(rel, `ancre introuvable → #${m[1]}`);
  }

  /* --- 5. Identifiants uniques ---
     Un id en double casse les ancres et les liens d'évitement, et le
     validateur W3C le refuse. */
  const tousIds = [...horsScript.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const doublons = [...new Set(tousIds.filter((v, i) => tousIds.indexOf(v) !== i))];
  for (const d of doublons) signaler(rel, `id en double → #${d}`);

  /* --- 6. Hiérarchie des titres ---
     Passer de h1 à h3 sans h2 dégrade l'accessibilité et brouille la
     structure que les moteurs utilisent pour comprendre la page. */
  const niveaux = [...horsScript.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  const nbH1 = niveaux.filter((n) => n === 1).length;
  if (nbH1 === 0) signaler(rel, 'aucun <h1>');
  if (nbH1 > 1) signaler(rel, `${nbH1} balises <h1> (il en faut exactement une)`);
  for (let i = 1; i < niveaux.length; i++) {
    if (niveaux[i] > niveaux[i - 1] + 1) {
      signaler(rel, `saut de niveau de titre : h${niveaux[i - 1]} suivi de h${niveaux[i]}`);
      break; // un signalement par page suffit
    }
  }

  /* --- 7. Ressources déclarées dans <link> --- */
  for (const m of horsScript.matchAll(/<link[^>]+href="([^"]+)"/g)) {
    const h = m[1];
    if (/^https?:/.test(h)) continue;
    const c = h.startsWith('/') ? join(RACINE, h) : resolve(dirname(fichier), h);
    if (!existsSync(c)) signaler(rel, `ressource absente → ${h}`);
  }
}

console.log(erreurs ? `\n${erreurs} problème(s).` : '\nTout est cohérent : JSON-LD valide, aucun lien ni média manquant.');
process.exit(erreurs ? 1 : 0);
