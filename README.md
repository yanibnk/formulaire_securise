 Formulaire de Contact Sécurisé

Ce projet présente un formulaire de contact sécurisé en local, intégrant une authentification utilisateur, Google reCAPTCHA, sessions sécurisées et une protection complète contre les vulnérabilités courantes (XSS, injection SQL, robots).

 Fonctionnalités

Connexion sécurisée : Accès réservé via authentification (email + mot de passe haché)

Protection anti-robots : Google reCAPTCHA (formulaire et login)

Sécurité des sessions : Cookies sécurisés (HttpOnly, Secure, SameSite)

Protection des données : Hashage des messages via bcrypt

HTTPS local : Certificat auto-signé pour TLS

Logging : Suivi des messages reçus avec logs d’accès

 Structure du projet

formulaire_securise/


├── config/              # Certificat HTTPS
├── data/                # Messages et utilisateurs
├── logs/                # Logs d’accès
├── public/              # Fichiers publics (CSS, login.html)
├── protected/           # Page protégée (index.html)
├── src/
│   └── server.js        # Serveur Node.js
├── package.json
└── README.md

🔧 Installation rapide

Cloner le projet :

git clone <url-du-repo>
cd formulaire_securise

Installer les dépendances :

npm install

Générer votre certificat HTTPS local (déjà inclus sinon) :

openssl req -nodes -new -x509 -keyout config/key.pem -out config/cert.pem -days 365

⚙️ Démarrer l’application

En développement :

npm start

En production (cookie secure activé) :

# Sur Windows PowerShell
$env:NODE_ENV="production"; npm start

# Linux/MacOS
NODE_ENV=production npm start

Accéder ensuite à :

https://localhost:3000

 Tester l’application

Utilisateur de test :

Email : jean@example.com

Mot de passe : motdepasse123

Tests recommandés

Vérifier le reCAPTCHA sur /login et /

Essayer des injections SQL ou scripts XSS (devraient être neutralisés)

Vérifier les cookies sécurisés dans les DevTools

 Auteur

Yani Benkhelifa

EPSI Paris

Projet réalisé dans le cadre du cours Sécurité by designe.

