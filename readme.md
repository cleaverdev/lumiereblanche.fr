# ✦ Lumière Blanche — Documentation Complète

## Structure des fichiers

```
lumiereblanche/
├── index.html              → Page principale
├── mentions.html           → Mentions légales / RGPD
├── css/
│   └── style.css           → Styles globaux + Tarifs + Réservation
├── js/
│   ├── config.js           → ⚠️  VOTRE CLÉ API ICI
│   ├── tirage-ai.js        → Module tirage propulsé par Claude AI
│   ├── main.js             → Animations, nav, étoiles, formulaire
│   └── stars.js            → Étoiles pour les pages secondaires
└── api/
    └── proxy.php           → Proxy sécurisé (clé côté serveur)
```

---

## 1. Déploiement — Site principal (HTML/JS)

Uploadez tout le contenu sur votre VPS dans `/var/www/lumiereblanche/`.

### Configurer la clé API Anthropic

Éditez `js/config.js` :
```js
ANTHROPIC_API_KEY: 'sk-ant-api03-VOTRE_VRAIE_CLÉ_ICI',
```

> ⚠️ **En production**, activez `USE_PROXY: true` et utilisez `api/proxy.php` pour ne jamais exposer la clé dans le navigateur.

### Configurer Cal.com (réservation)

1. Créez un compte gratuit sur [cal.com](https://cal.com)
2. Configurez vos types d'événements (consultation, guidance, etc.)
3. Éditez `js/config.js` :
```js
CAL_USERNAME: 'votre-username-cal',
CAL_EVENT_TYPE: 'consultation',
```
4. Puis dans `index.html`, remplacez le bloc `cal-placeholder` par l'embed Cal.com :
```html
<!-- Inline embed Cal.com -->
<script type="text/javascript">
  (function (C, A, L) {
    let p = function (a, ar) { a.q.push(ar); };
    let d = C.document;
    C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; typeof namespace === "string" ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar); return; } p(cal, ar); };
  })(window, "https://app.cal.com/embed/embed.js", "init");
  Cal("init", {origin:"https://cal.com"});
  Cal("inline", {
    elementOrSelector:"#cal-embed-container",
    calLink: "VOTRE_USERNAME/consultation",
    layout: "month_view"
  });
  Cal("ui", {"theme":"dark","styles":{"branding":{"brandColor":"#d4af37"}},"hideEventTypeDetails":false});
</script>
```

### Configuration Nginx (exemple)
```nginx
server {
    listen 443 ssl;
    server_name lumiereblanche.fr;
    root /var/www/lumiereblanche;
    index index.html index.php;

    location / { try_files $uri $uri/ =404; }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

---

## 2. Mentions légales

La page `mentions.html` est liée depuis le pied de page et depuis le bandeau cookies.

Avant la mise en ligne, complétez tous les champs encadrés en pointillés dorés
(classe CSS `.fill` dans le HTML) :

- Identité de l'éditeur : nom, forme juridique, adresse, SIRET, code APE, TVA, RCS
- Directeur de la publication
- Coordonnées de l'hébergeur
- Responsable du traitement des données
- Prestataires destinataires des données (Cal.com, avis clients, emailing…)
- Modalités de paiement et conditions d'annulation
- Médiateur de la consommation
- Date de dernière mise à jour

Une fois complétés, supprimez l'encadré d'avertissement en haut de la page
(bloc `.legal-note`) ainsi que la règle `.fill` si plus aucun champ n'en dépend.

---

## 3. Réseaux sociaux

Liens configurés dans le pied de page de `index.html` :

- Instagram → `https://www.instagram.com/lumiere_blanche64`
- TikTok → `https://www.tiktok.com/@lumiereblanche_64`

---

## 4. Proxy API sécurisé (production)

Éditez `api/proxy.php` :
```php
define('ANTHROPIC_API_KEY', 'sk-ant-api03-VOTRE_CLÉ');
define('ALLOWED_ORIGIN',    'https://lumiereblanche.fr');
```

Activez dans `js/config.js` :
```js
USE_PROXY: true,
PROXY_URL: 'api/proxy.php',
ANTHROPIC_API_KEY: '',  // Laisser vide si proxy activé
```

---

## 5. Checklist de mise en ligne

- [ ] Clé API Anthropic configurée
- [ ] Compte Cal.com créé + embed intégré
- [ ] Champs des mentions légales complétés
- [ ] Comptes Instagram et TikTok vérifiés dans le pied de page
- [ ] Proxy PHP activé en production
- [ ] HTTPS activé (Let's Encrypt)
- [ ] Nginx/Apache configuré pour PHP (proxy API)
- [ ] Fichiers de configuration hors du dépôt Git

---

✦ *Lumière Blanche — Que la lumière vous guide*
