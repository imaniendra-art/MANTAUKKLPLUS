import dbConnect from './lib/db.js';
import User from './models/User.js';

async function test() {
  await dbConnect();
  const users = await User.find({});
  console.log(JSON.stringify(users.map(u => ({ email: u.email, nim_nidn: u.nim_nidn, role: u.role, isFirstLogin: u.isFirstLogin })), null, 2));
  process.exit(0);
}

test();
