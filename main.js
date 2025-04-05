const { app, BrowserWindow } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Sécurité: pas de Node.js dans la page
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

// Gestion du menu déroulant
const appMenu = document.getElementById('appMenu');
const appDropdown = document.getElementById('appDropdown');

appMenu.addEventListener('click', function() {
  appDropdown.classList.toggle('show');
});

document.addEventListener('click', function(event) {
  if (!appMenu.contains(event.target)) {
    appDropdown.classList.remove('show');
  }
});

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

window.onload = function() {
  if (JSON.parse(localStorage.getItem('darkMode'))) {
    document.body.classList.add('dark-mode');
  }
  checkLoginStatus();

  document.getElementById('search').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      redirectUser();
    }
  });

  // Vérifie l'état de connexion Google
  checkGoogleLogin();
};

function checkLoginStatus() {
  let user = localStorage.getItem('currentUser');
  if (user) {
    document.getElementById('user-info').textContent = user;
    document.getElementById('logout-btn').style.display = 'inline-block';
  }
}

function toggleAuthForm() {
  const form = document.getElementById('auth-form');
  form.style.display = form.style.display === 'block' ? 'none' : 'block';
}

function toggleResetForm() {
  const resetForm = document.getElementById('reset-form');
  const authForm = document.getElementById('auth-form');
  resetForm.style.display = resetForm.style.display === 'block' ? 'none' : 'block';
  if (resetForm.style.display === 'block') {
    authForm.style.display = 'none'; // Ferme le formulaire de connexion si réinitialisation ouverte
  }
}

function register() {
  let username = document.getElementById('username').value.trim();
  let password = document.getElementById('password').value.trim();

  if (!username || !password) {
    alert("Remplissez tous les champs !");
    return;
  }

  let users = JSON.parse(localStorage.getItem('users')) || {};
  if (users[username]) {
    alert("Nom d'utilisateur déjà pris !");
    return;
  }

  users[username] = password;
  localStorage.setItem('users', JSON.stringify(users));
  alert("Compte créé avec succès !");
  toggleAuthForm();
}

function login() {
  let username = document.getElementById('username').value.trim();
  let password = document.getElementById('password').value.trim();

  let users = JSON.parse(localStorage.getItem('users')) || {};

  if (users[username] === password) {
    localStorage.setItem('currentUser', username);
    document.getElementById('user-info').textContent = username;
    document.getElementById('logout-btn').style.display = 'inline-block';
    toggleAuthForm();
  } else {
    alert("Nom d'utilisateur ou mot de passe incorrect !");
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  document.getElementById('user-info').textContent = "Invité";
  document.getElementById('logout-btn').style.display = 'none';
}

function resetPassword() {
  let username = document.getElementById('reset-username').value.trim();
  let users = JSON.parse(localStorage.getItem('users')) || {};

  if (!username) {
    alert("Veuillez entrer un nom d'utilisateur !");
    return;
  }

  if (!users[username]) {
    alert("Ce nom d'utilisateur n'existe pas !");
    return;
  }

  // Générer un mot de passe temporaire (simple ici pour la démo)
  let tempPassword = Math.random().toString(36).slice(-8); // Mot de passe aléatoire de 8 caractères
  users[username] = tempPassword;
  localStorage.setItem('users', JSON.stringify(users));

  alert(`Votre mot de passe temporaire est : ${tempPassword}\nConnectez-vous avec ce mot de passe, puis changez-le.`);
  toggleResetForm();
}

function redirectUser() {
  const { shell } = require('electron'); // Ajoute ceci en haut de <script> dans index.html

  function redirectUser() {
    let query = document.getElementById('search').value.trim().toLowerCase();
    const redirections = {
      "youtube": "https://www.youtube.com",
      "google": "https://www.google.com",
      "chatgpt": "https://chat.openai.com",
      "github": "https://github.com",
      "wikipedia": "https://www.wikipedia.org"
    };
    let url = redirections[query] || `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    shell.openExternal(url); // Ouvre dans le navigateur par défaut
  }

  let url = redirections[query] || `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  window.location.href = url;
}

function clearHistory() {
  alert("Historique supprimé !");
}

// Vérifie si l'utilisateur est connecté à Google
function checkGoogleLogin() {
  fetch('https://mail.google.com/mail/u/0/')
    .then(response => {
      if (response.ok) {
        openGmailPopup();
      }
    })
    .catch(error => console.log('Non connecté à Google'));
}

// Ouvre un pop-up pour Gmail
function openGmailPopup() {
  let popup = window.open('https://mail.google.com', 'GmailPopup', 'width=800,height=600');
  if (!popup || popup.closed || typeof popup.closed == 'undefined') {
    alert('Veuillez autoriser les pop-ups pour voir Gmail.');
  }
}

// Ajout du pop-up pour Gmail avec Ctrl+Alt+Up+Down
document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.altKey && event.key === 'ArrowUp') {
    let popup = window.open('https://mail.google.com', 'GmailPopup', 'width=800,height=600');
    if (!popup || popup.closed || typeof popup.closed == 'undefined') {
      alert('Veuillez autoriser les pop-ups pour voir Gmail.');
    }
  }
});

// Ajout du pop-up pour ChatGPT avec Ctrl+Alt+Ins
document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.altKey && event.key === 'Insert') {
    let popup = window.open('https://chat.openai.com', 'ChatGPTPopup', 'width=800,height=600');
    if (!popup || popup.closed || typeof popup.closed == 'undefined') {
      alert('Veuillez autoriser les pop-ups pour voir ChatGPT.');
    }
  }
});
