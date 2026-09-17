/**
 * servir.mjs — Petit serveur local pour prévisualiser le site.
 *
 *   npm run servir     →  http://localhost:8080
 *
 * Reproduit le comportement de GitHub Pages : les dossiers servent leur
 * index.html, et une adresse inconnue renvoie la page 404 du site.
 * Aucune dépendance : uniquement les modules fournis par Node.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const PORT = Number(process.env.PORT) || 8080;
const RACINE = process.cwd();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
};

createServer(async (requete, reponse) => {
  const chemin = decodeURIComponent(requete.url.split('?')[0]);
  // normalize() neutralise les tentatives de remontée hors du dossier.
  let fichier = join(RACINE, normalize(chemin).replace(/^(\.\.[/\\])+/, ''));

  try {
    if ((await stat(fichier)).isDirectory()) fichier = join(fichier, 'index.html');
  } catch { /* le fichier n'existe pas : traité juste en dessous */ }

  try {
    const contenu = await readFile(fichier);
    reponse.writeHead(200, {
      'Content-Type': TYPES[extname(fichier).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    reponse.end(contenu);
    console.log('200 ' + chemin);
  } catch {
    const page404 = await readFile(join(RACINE, '404.html')).catch(() => '<h1>404</h1>');
    reponse.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    reponse.end(page404);
    console.log('404 ' + chemin);
  }
}).listen(PORT, () => {
  console.log(`Site servi sur http://localhost:${PORT}`);
  console.log('Ctrl+C pour arrêter.');
});
