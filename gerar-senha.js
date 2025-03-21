const bcrypt = require('bcrypt');

const senha = "SuaSenhaAqui"; // A senha que você quer usar
const saltRounds = 10; // Número de rounds para o bcrypt (10 é um bom padrão)

bcrypt.hash(senha, saltRounds, (err, hash) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Senha criptografada:", hash);
});