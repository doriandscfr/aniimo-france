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

### Remplacer les données de l'Aniimopédia

Les 8 créatures actuelles sont des **exemples inventés** (c'était déjà noté
dans `MODE-D-EMPLOI.md`). Elles sont maintenant écrites en dur dans le HTML
et donc indexables — ce qui amplifie le problème.

👉 Remplace-les par de vraies données dans le tableau `CREATURES` de
`aniimopedia/index.html`, puis `npm run pedia`.

Note aussi que les rôles réels du jeu sont **DPS, Rupture, Soigneur, Support
et Régénération** — les filtres actuels affichent « Tank » et « Soin », à
corriger.

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
