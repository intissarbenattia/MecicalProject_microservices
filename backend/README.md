**Medical Cabinet — Backend**

- **Description**: API REST pour l'application "Medical Cabinet" (gestion des utilisateurs, patients, médecins, rendez-vous, consultations, paiements, etc.). Le backend est une application Node.js/Express connectée à une base MongoDB.
- **Postman**: Une collection Postman est fournie: `Medical-Cabinet-API.postman_collection.json`.

**Prérequis**:
- **Node.js**: version LTS recommandée (>= 16).
- **npm**: fourni avec Node.js.
- **MongoDB**: base de données disponible (URI MongoDB).

**Installation**:
1. Ouvrir un terminal et se placer dans le dossier `backend`:

```powershell
cd C:\Users\user\Desktop\mern\Projet-Semestriel\medical-cabinet\backend
```

2. Installer les dépendances:

```powershell
npm install
```

3. Créer un fichier `.env` à partir des variables listées ci-dessous.

**Variables d'environnement (exemples)**:
- `PORT=5000`
- `MONGO_URI=mongodb://localhost:27017/medical-cabinet`
- `JWT_SECRET=une_chaine_secrete`
- `EMAIL_HOST=smtp.example.com` (ou `smtp.gmail.com`)
- `EMAIL_PORT=587`
- `EMAIL_USER=your@email.com`
- `EMAIL_PASS=mot_de_passe_email`
- `CLIENT_URL=http://localhost:3000` (URL du frontend)
- # Google OAuth (si utilisé)
- `GOOGLE_CLIENT_ID=your_google_client_id`
- `GOOGLE_CLIENT_SECRET=your_google_client_secret`

Ajoutez dans `.env` uniquement les variables que votre code utilise réellement. Ne commitez jamais le fichier `.env` (déjà ignoré par `.gitignore`).

**Scripts courants**:
- Démarrer en développement (avec `nodemon` si installé globalement dans le projet):

```powershell
npm run dev
```

- Démarrer en production:

```powershell
npm start
```

(Remarque: adaptez selon les scripts définis dans `package.json` du dossier `backend`.)

**Structure du dossier (extrait)**:
- `server.js` — point d'entrée de l'application.
- `config/` — configuration (base de données, passport, mailer, etc.).
- `controllers/` — logique métier par ressource (auth, patient, medecin, rendezVous...).
- `models/` — schémas Mongoose.
- `routes/` — définitions des routes Express.
- `middleware/` — middlewares (ex: authentification).
- `utils/` et `pdfs/` — utilitaires et génération de PDF.

**Endpoints principaux** (liste non exhaustive)
- `POST /auth/register` — créer un utilisateur.
- `POST /auth/login` — authentification.
- `GET /auth/profile` — récupérer profil (auth requis).
- Routes CRUD pour `patients`, `medecins`, `rendezvous`, `consultations`, `paiements`, `secretaires` (voir dossier `routes/`).

**Authentification**:
- Le projet utilise JWT. Assurez-vous que `JWT_SECRET` est défini.
- Le token est attendu dans l'entête `Authorization: Bearer <token>` pour les routes protégées.

**Mailer**:
- La configuration d'envoi d'e-mails se trouve dans `config/mailer.js`. Configurez les variables `EMAIL_*` selon votre fournisseur SMTP.

**Postman**:
- Importez `Medical-Cabinet-API.postman_collection.json` dans Postman pour tester rapidement les endpoints.

**Conseils de déploiement**:
- Ne commitez pas vos secrets.
- Utilisez des variables d'environnement sécurisées (ex: Azure KeyVault, AWS Secrets Manager).
- Configurez un processus de démarrage (PM2, systemd) pour la production.

**Tests**:
- Aucun framework de test n'est inclus par défaut (vérifiez `package.json`). Vous pouvez ajouter `jest` ou `mocha` selon vos préférences.

**Fichiers utiles**:
- `package.json` — scripts et dépendances.
- `.gitignore` — déjà configuré pour ignorer `node_modules` et `.env`.

**Support / Prochaines étapes**:
- Ajouter un `README` en anglais si nécessaire.
- Générer un fichier `.env.example` listant les variables attendues (optionnel).
- Documenter chaque route dans un fichier `docs/` ou via OpenAPI/Swagger.

---

Si tu veux, je peux aussi:
- ajouter automatiquement un fichier `backend/.env.example` avec les variables listées;
- vérifier et compléter les scripts dans `backend/package.json` et adapter les commandes du README.
