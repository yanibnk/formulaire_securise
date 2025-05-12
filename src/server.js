const express = require('express');
const fs = require('fs');
const https = require('https');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');

const app = express();

// Active le proxy pour permettre secure=true si derrière un proxy
app.set('trust proxy', 1);

// Sécurité des en-têtes HTTP (CSP désactivée temporairement pour reCAPTCHA)
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// Parse les données du formulaire
app.use(bodyParser.urlencoded({ extended: false }));

// Sert les fichiers HTML/CSS/JS
app.use(express.static(path.join(__dirname, '..', 'public')));

// Session sécurisée (secure activé en prod uniquement)
app.use(session({
  secret: 'maCleSecreteUltraComplexe',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 60 * 1000 // 30 minutes
  }
}));

// Middleware pour vérifier l'authentification
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// Route GET pour le formulaire (protégé)
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'protected', 'index.html'));
});


// Route GET pour afficher la page de connexion
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// Route POST pour la connexion utilisateur avec reCAPTCHA
app.post('/login', async (req, res) => {
  const { email, password, 'g-recaptcha-response': captcha } = req.body;

  if (!captcha) {
    return res.status(400).send('Captcha manquant.');
  }

  const secretKey = '6LdbsTYrAAAAACaimKujMKKK0NgAny8qBFEzly1B';

  try {
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
    const captchaRes = await fetch(verifyURL, { method: 'POST' });
    const data = await captchaRes.json();

    if (!data.success) {
      return res.status(403).send('Captcha invalide.');
    }

    const usersPath = path.join(__dirname, '..', 'data', 'users.json');
    const users = JSON.parse(fs.readFileSync(usersPath));
    const user = users.find(u => u.email === email);

    if (!user) return res.status(401).send('Utilisateur inconnu.');
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(403).send('Mot de passe incorrect.');

    req.session.user = { email: user.email, name: user.name };
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur.');
  }
});

// Route GET pour la déconnexion
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Route pour traiter le formulaire (protégée aussi par session)
app.post('/submit', requireAuth, async (req, res) => {
  console.log('Requête reçue :', req.body);

  const { name, email, message, 'g-recaptcha-response': captcha } = req.body;
  const user = req.session.user;

  if (!captcha) {
    return res.status(400).send('Captcha manquant.');
  }

  const secretKey = '6LdbsTYrAAAAACaimKujMKKK0NgAny8qBFEzly1B';

  try {
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
    const captchaRes = await fetch(verifyURL, { method: 'POST' });
    const data = await captchaRes.json();

    if (!data.success) {
      return res.status(403).send('Captcha invalide.');
    }

    const hashedMessage = await bcrypt.hash(message, 10);

    const entry = {
      userName: user.name,
      userEmail: user.email,
      message: hashedMessage,
      date: new Date().toISOString()
    };

    const messagesPath = path.join(__dirname, '..', 'data', 'messages.json');
    const messages = fs.existsSync(messagesPath)
      ? JSON.parse(fs.readFileSync(messagesPath))
      : [];

    messages.push(entry);
    fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));

    const logPath = path.join(__dirname, '..', 'logs', 'access.log');
    fs.appendFileSync(logPath, `Message de ${user.email} - ${new Date().toISOString()}\n`);

    res.send('Message reçu avec succès.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur.');
  }
});

// Lancement du serveur HTTPS
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '..', 'config', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '..', 'config', 'cert.pem'))
};

https.createServer(httpsOptions, app).listen(3000, () => {
  console.log('Serveur HTTPS actif sur https://localhost:3000');
});
