const bcrypt = require('bcrypt');

async function generatePassword() {
  const password = 'AdminTeta@123';
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed Password:', hashedPassword);
}

generatePassword();

// INSERT INTO users (name, email, password, role)
// VALUES (
//   'Admin User',
//   'admin@park.com',
//   '$2b$10$XLjYg.l8W2BsmYQVsi31nupo9g10mdlx7sOSWe4oPRSKJCCNCw.I.',
//   'admin'
// );