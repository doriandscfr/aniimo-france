# 🔍 Référencement d'aniimo-france.fr

Ce fichier a deux parties :

1. **Ce qui est fait** — déjà en place dans le code, rien à refaire.
2. **Ce qu'il te reste à faire** — les actions hors du code, que seul le
   propriétaire du site peut réaliser (comptes, liens externes, contenu).

---

# 1. Ce qui est en place

## Fichiers techniques

| Fichier | Rôle |
|---|---|
| `robots.txt` | Autorise explicitement les robots des moteurs **et des IA** (ChatGPT, Claude, Perplexity, Gemini). Être cité par une IA est devenu une source de trafic. |
| `sitemap.xml` | **Généré automatiquement** par `npm run seo`. Inclut les images. Plus besoin d'y penser à la main. |
| `llms.txt` | Plan du site destiné aux moteurs de réponse, avec une fiche de référence sur le jeu. |
| `404.html` | Page d'erreur personnalisée, en `noindex`, qui renvoie vers les sections utiles. |
| `site.webmanifest` | Installation du site en application sur mobile. |
| `.nojekyll` | Désactive Jekyll sur GitHub Pages : déploiements plus rapides, pas de surprise. |
| `<clé>.txt` | Clé IndexNow. **Ne pas supprimer** : c'est elle qui prouve aux moteurs que le domaine t'appartient. |

## Données structurées (JSON-LD)

Chaque page en possède. C'est ce qui permet d'obtenir des résultats enrichis
dans Google (étoiles, questions dépliables, fil d'Ariane).

- **Accueil** — `Organization`, `WebSite` (+ recherche interne), `WebPage`, `VideoGame`, `FAQPage`
- **`/aniimo/`** — `VideoGame`, `Article`, `FAQPage`, `BreadcrumbList`
- **`/codes/`** — `Article`, `HowTo`, `FAQPage`, `BreadcrumbList`
- **`/guides/`** — `CollectionPage` + `ItemList`
- **Guides** — `Article`, `HowTo`, `FAQPage`
- **`/aniimopedia/`** — `CollectionPage` + `ItemList` des créatures
- **Patch notes** — `CollectionPage` + `NewsArticle` par note

## Performance (Core Web Vitals)

- Bannière : **1,5 Mo → 466 Ko**, plus une version JPEG dédiée aux réseaux sociaux (248 Ko)
- Favicons recompressés : 77 Ko → 23 Ko
- Vidéos du hero : `poster` en WebP, `preload="none"`, dimensions déclarées (évite le décalage de mise en page)
- Polices Google chargées **sans bloquer le rendu**

## Contenu

Pages créées, chacune ciblant des recherches réelles :

| Page | Recherches visées |
|---|---|
| `/aniimo/` | « aniimo date de sortie », « aniimo gratuit », « aniimo config pc », « aniimo crossplay » |
| `/codes/` | « codes aniimo », « code cadeau aniimo » — **fort volume, à tenir à jour** |
| `/guides/types-et-faiblesses/` | « aniimo types », « tableau des types aniimo » — recherche permanente |
| `/guides/bien-debuter/` | « bien débuter aniimo », « guide débutant aniimo » |
| `/guides/capture-anipod/` | « capturer aniimo », « anipod » |
| `/a-propos/`, `/mentions-legales/` | Signaux de confiance (E-E-A-T), obligation légale |

---

# 2. Ce qu'il te reste à faire

## ⚠️ À faire en priorité absolue

### Vérifier le tableau des types

Le tableau de `/guides/types-et-faiblesses/` a été reconstitué à partir de
relevés communautaires **croisés entre trois sources**, dont deux se
contredisaient. Il est cohérent, mais **il n'a pas été vérifié en jeu**.

Un tableau de types faux fait perdre des combats aux lecteurs : c'est le
genre d'erreur qui ruine la crédibilité d'un site communautaire.

👉 Vérifie quelques matchups en jeu. Pour corriger, modifie l'objet `TABLE`
dans `tools/pages.mjs` (une ligne par élément), puis `npm run pages`.

### Remplir l'Aniimopédia — le blocage numéro un

Les 8 créatures inventées ont été **retirées le 22 septembre 2026**. La page
est passée en `noindex`, sortie du sitemap, et affiche un bandeau « base en
cours de constitution ». Les exemples restent archivés dans
`data/creatures.json`.

**Pourquoi c'est le blocage principal :** le concurrent qui occupe la
première place sur « aniimo france » (aniimofrance.com) publie **98 fiches
avec de vraies statistiques** — ATK, PV, D.P, D.M, BRK, RGN — plus une Tier
List et une carte interactive. Tant que ta base est vide, l'écart de contenu
reste infranchissable, quelle que soit la qualité technique du site.

👉 Relève les vraies valeurs, remplis le tableau `CREATURES` dans
`aniimopedia/index.html`, lance `npm run pedia`, puis **repasse la balise
robots du `<head>` en `index, follow`**. Le format attendu est documenté
en commentaire juste au-dessus du tableau.

Les rôles ont été corrigés : **DPS, BREAK, SUPPORT, REGEN, HEAL** (et non
plus Tank/Soin, qui n'existent pas dans le jeu).

### Compléter les mentions légales

Le bloc « À compléter » de `/mentions-legales/` attend un nom ou pseudonyme
et un moyen de contact. C'est une obligation légale en France, même pour un
site non professionnel.

---

## Inscriptions à faire une fois

### Google Search Console — indispensable

1. <https://search.google.com/search-console> → ajouter la propriété `aniimo-france.fr`
2. Validation par **enregistrement DNS TXT** (préférable : couvre tout le domaine)
3. **Sitemaps** → soumettre `sitemap.xml`
4. **Inspection d'URL** → coller chaque nouvelle page → « Demander une indexation »

> Google **ne participe pas** à IndexNow. L'inspection d'URL est le seul
> moyen d'accélérer son indexation.

### Bing Webmaster Tools

<https://www.bing.com/webmasters> — l'import depuis Search Console fait tout
en un clic. Alimente aussi ChatGPT et Copilot, qui s'appuient sur l'index Bing.

### IndexNow — déjà prêt

Après chaque publication :

```bash
npm run indexnow                 # toutes les URL du sitemap
npm run indexnow /codes/         # une seule page
```

Prévient Bing, Yandex, Seznam et Naver en une requête.

### Mesure d'audience

Sans cookie et sans bandeau RGPD : [Plausible](https://plausible.io) ou
[Umami](https://umami.is). Google Analytics impose un bandeau de consentement
et alourdit les pages.

---

## Liens externes (le levier le plus fort restant)

Le contenu et la technique sont en place. Ce qui décidera du classement,
maintenant, ce sont les **liens entrants**.

### Annuaires Discord — rapide et efficace

Tu es déjà présent sur Top.gg, Disboard, Discords.com, Discord.me et
Discordl. Sur chacun, **vérifie que la description contient un lien vers
`aniimo-france.fr`**, pas seulement l'invitation Discord.

À ajouter si absent : Discadia, Discord Servers, Discord Home.

### Communautés francophones

- **Reddit** — r/jeuxvideo, r/france, et le subreddit Aniimo. Réponds à de
  vraies questions en citant la page utile. Ne poste pas de lien seul.
- **jeuxvideo.com** — forum Aniimo, avec la signature du site
- **Discord** d'autres communautés de jeux de capture (Pokémon, Palworld, Temtem)
- **X / Bluesky / TikTok / YouTube** — crée les comptes au même nom, avec le
  lien en bio. Ajoute-les ensuite dans `sameAs` du bloc `Organization`
  (accueil, `index.html`) : Google s'en sert pour relier les profils à l'entité.

### Wikis et bases de données

- **Fandom / wiki Aniimo** — ajoute Aniimo France aux liens externes communautaires
- **SensCritique, Steam** (discussions) — présente le serveur FR

### Créateurs de contenu

Les streamers et youtubeurs FR qui jouent à Aniimo cherchent une communauté
où envoyer leur audience. Un lien depuis une description de vidéo pèse lourd.

---

## Entretien

| Fréquence | Action |
|---|---|
| À chaque nouveau code | Mettre à jour `/codes/` + changer la date + `npm run indexnow /codes/` |
| À chaque patch | Publier la note, puis `npm run build` |
| Chaque mois | `npm run controle` pour vérifier qu'aucune page n'a dérivé |
| Chaque trimestre | Relire les dates de mise à jour : une page « mise à jour il y a 6 mois » perd des places |

**La fraîcheur compte énormément** sur un jeu-service. Une page `/codes/`
mise à jour chaque semaine battra un concurrent mieux établi mais périmé.

---

## Commandes

```bash
npm run build       # régénère tout (pages, Aniimopédia, patch notes, sitemap, llms.txt)
npm run controle    # audit SEO + vérification des liens et du JSON-LD (local)
npm run enligne     # vérifie le site réellement publié, après un push
npm run servir      # prévisualisation sur http://localhost:8080
npm run indexnow    # signale les URL aux moteurs
```

`npm run controle` doit toujours finir sans erreur avant un `git push`.

---

# 3. Mise à jour du 16 octobre 2026

## Ce que disait la Search Console

Après un mois en ligne, **8 des 9 requêtes qui amènent du trafic portent sur
les faiblesses élémentaires** — 122 clics, contre 23 pour le Discord :

| Requête | Clics |
|---|---|
| faiblesse aniimo | 32 |
| discord aniimo fr | 23 |
| aniimo faiblesse | 18 |
| aniimo faiblesse elementaire | 14 |
| aniimo contre | 14 |
| tableau type aniimo | 13 |
| tableau element aniimo | 11 |
| tableau faiblesse aniimo | 10 |
| aniimo tableau élémentaire | 10 |

Deux enseignements : les joueurs cherchent **« faiblesse »**, pas « types », et
ils veulent un **tableau**. Le site a été réaligné là-dessus.

## Ce qui a été fait

- **Tableau des types corrigé.** Revérifié contre deux sources concordantes.
  La version de septembre était incomplète : le Feu est bien fort contre la
  Glace, et plusieurs résistances manquaient. Les données vivent désormais
  dans `tools/elements.mjs`, partagées par toutes les pages concernées.
- **9 fiches par élément** créées sous `/guides/types-et-faiblesses/<élément>/`,
  chacune visant « faiblesse <élément> aniimo ». Le sitemap passe de 13 à 22 URL.
- **Page pivot réoptimisée** : titre et H1 mènent désormais par « Faiblesses ».
- **Page codes refondue** : 2 codes périmés → 15 codes d'octobre, pilotés par
  une liste dans `tools/pages-codes.mjs` (mise à jour en deux minutes).
- **Page mobile remise au présent** : elle annonçait encore un pré-téléchargement
  pour un jeu sorti depuis un mois.
- **Rôles alignés sur le jeu** : DPS, BREAK, SUPPORT, REGEN, HEAL.

## Entretien renforcé

| Fréquence | Action |
|---|---|
| **Chaque semaine** | Vérifier `/codes/` : éditer `CODES` dans `tools/pages-codes.mjs`, puis `npm run codes && npm run indexnow /codes/` |
| Après chaque patch | Vérifier que le tableau des types n'a pas bougé (`tools/elements.mjs`) |
| Chaque mois | Relire la Search Console : les requêtes dictent les prochaines pages |

## L'Aniimopédia est remplie

**98 créatures** ont été reconstituées le 16 octobre par recoupement de deux
index indépendants : 82 sont confirmées par les deux sources, 16 n'ont été
vues que dans une seule et portent une réserve visible.

La base de données du concurrent n'a **pas** été recopiée : en Europe, une
compilation de ce type est protégée par le droit sui generis des bases de
données, et les mentions légales du site s'engagent sur le respect de la PI.

- `data/creatures.json` est la source de vérité. On l'édite, puis `npm run pedia`.
- Chaque créature a sa page indexable : `/aniimopedia/<nom>/` — 98 pages.
- Les faiblesses ne sont pas saisies, elles sont **déduites** de
  `tools/elements.mjs`. Corriger le tableau des éléments corrige les 98 fiches.

### Ce qui manque encore

**Les statistiques chiffrées et les descriptions.** Aucune source publique ne
les donne de façon concordante : elles se relèvent en jeu. Les champs
`stats` et `description` de chaque entrée les attendent.

**La tier list.** Requête à fort volume, mais les quatre classements publics
consultés se contredisent franchement. À construire sur des relevés propres.

