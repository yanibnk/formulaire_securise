const bcrypt = require('bcrypt');
const fs = require('fs');

async function createUser() {
  const password = 'motdepasse123';
  const hashed = await bcrypt.hash(password, 10);

  const user = {
    name: "yani",
    email: "yani@test.com",
    password: hashed
  };

  fs.writeFileSync('data/users.json', JSON.stringify([user], null, 2));
  console.log("✅ Utilisateur créé avec succès !");
}

createUser();
