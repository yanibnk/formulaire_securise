// Vérification basique côté client
document.getElementById('contact-form').addEventListener('submit', function(e) {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
  
    if (!name || !email || !message) {
      alert('Tous les champs sont requis.');
      e.preventDefault();
    }
  });
  