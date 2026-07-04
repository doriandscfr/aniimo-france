# Guide de déploiement — Site Aniimo France

Objectif : mettre en ligne le site sur **GitHub Pages**, le brancher sur le domaine **aniimo-france.fr** (acheté chez OVH), et le faire indexer par Google le plus vite possible.

---

## Étape 1 — Créer le dépôt GitHub et publier le site

1. Connecte-toi sur github.com avec ton compte (doriandscfr).
2. Crée un nouveau dépôt **public** nommé par exemple `aniimo-france`.
3. Sur ton PC, dans PowerShell :

```powershell
cd C:\chemin\vers\le\dossier\aniimo-france-site
git init
git add .
git commit -m "Site Aniimo France - version initiale"
git branch -M main
git remote add origin https://github.com/doriandscfr/aniimo-france.git
git push -u origin main
```

4. Sur GitHub : **Settings → Pages** :
   - Source : `Deploy from a branch`
   - Branch : `main` / dossier `/ (root)` → **Save**
5. Attends 1 à 2 minutes : le site est en ligne sur
   `https://doriandscfr.github.io/aniimo-france/`

> Le fichier `CNAME` (déjà inclus) contient `aniimo-france.fr` : GitHub
> l'utilisera automatiquement dès que le domaine sera configuré.

---

## Étape 2 — Acheter le domaine aniimo-france.fr chez OVH

1. Va sur ovhcloud.com → **Domaines** → recherche `aniimo-france.fr`.
2. Ajoute-le au panier (~7 €/an pour un .fr). Pas besoin d'hébergement,
   GitHub Pages héberge gratuitement — prends uniquement le domaine.
3. Pendant la commande, OVH propose des options (hébergement, e-mails…) :
   tu peux tout refuser.

⚠️ C'est toi qui effectues l'achat et le paiement directement sur OVH.

---

## Étape 3 — Configurer les DNS chez OVH (pointer vers GitHub Pages)

Dans l'espace client OVH → ton domaine → **Zone DNS** :

### 3a. Supprimer les enregistrements par défaut
Supprime les enregistrements **A** et **CNAME** existants qui pointent
vers les serveurs OVH (redirection page en construction).

### 3b. Ajouter les 4 enregistrements A (domaine racine → GitHub)

| Type | Sous-domaine | Cible           |
|------|--------------|-----------------|
| A    | (vide)       | 185.199.108.153 |
| A    | (vide)       | 185.199.109.153 |
| A    | (vide)       | 185.199.110.153 |
| A    | (vide)       | 185.199.111.153 |

### 3c. Ajouter le CNAME pour www

| Type  | Sous-domaine | Cible                       |
|-------|--------------|-----------------------------|
| CNAME | www          | doriandscfr.github.io.      |

(le point final est important chez OVH)

### 3d. Déclarer le domaine côté GitHub
Retour sur GitHub → **Settings → Pages** :
- Champ **Custom domain** : `aniimo-france.fr` → Save
- Attends la vérification DNS (peut prendre de 10 min à 24 h)
- Coche **Enforce HTTPS** dès que la case devient disponible
  (GitHub génère un certificat Let's Encrypt automatiquement,
  comme tu l'as fait avec Certbot sur ton VPS).

---

## Étape 4 — Google Search Console (indexation rapide)

1. Va sur search.google.com/search-console
2. Ajoute une propriété → type **Domaine** → `aniimo-france.fr`
3. Google demande une vérification par **enregistrement TXT** :
   copie la valeur fournie, et chez OVH → Zone DNS → ajoute :

| Type | Sous-domaine | Cible                          |
|------|--------------|--------------------------------|
| TXT  | (vide)       | google-site-verification=XXXX  |

4. Une fois vérifié :
   - **Sitemaps** → soumets `https://aniimo-france.fr/sitemap.xml`
   - **Inspection d'URL** → colle `https://aniimo-france.fr/` →
     clique **Demander une indexation** (force Google à passer sous 24-72 h)

---

## Étape 5 — Après la mise en ligne (checklist SEO)

- [ ] Ajouter `banniere.png` (1200×630 px) à la racine du dépôt —
      c'est l'image utilisée dans les balises Open Graph pour les
      aperçus de partage (Discord, Twitter…). Ton logo Aniimo France
      sur fond ciel fonctionne parfaitement.
- [ ] Ajouter `favicon.png` (64×64 px) à la racine.
- [ ] Mettre le lien `https://aniimo-france.fr` dans la description
      du serveur Discord et sur toutes tes fiches d'annuaires
      (Disboard, Discadia, etc.) → chaque lien entrant = un backlink.
- [ ] Vérifier l'aperçu de partage : colle l'URL dans un salon Discord
      et regarde si le titre/description/image s'affichent.
- [ ] Dans 1 semaine : taper `site:aniimo-france.fr` sur Google pour
      vérifier l'indexation.

## Pour mettre à jour le site plus tard

```powershell
# modifier index.html, puis :
git add .
git commit -m "Mise à jour du site"
git push
```
GitHub Pages redéploie automatiquement en ~1 minute.
