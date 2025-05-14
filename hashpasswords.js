const bcrypt = require('bcryptjs');

async function hashPasswords() {
  const testUsers = [
    { username: 'test 1', password: 'password123' },
    { username: '1234', password: '1244%%' },
    { username: 'test text', password: 'alltext' }
  ];

  for (let user of testUsers) {
    const hashed = await bcrypt.hash(user.password, 10);
    console.log(`('${user.username}', '${hashed}'),`);
  }
}

hashPasswords();
