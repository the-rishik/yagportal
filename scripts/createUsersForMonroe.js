const mongoose = require('mongoose');
const User = require('../models/User');
const School = require('../models/School');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/njyag';

function mapRole(type) {
  if (type === 'student') return 'user';
  if (type === 'advisor') return 'advisor';
  return 'user';
}

async function main() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const school = await School.findOne({ schoolName: 'Monroe', status: 'approved' });
  if (!school) {
    console.error('No approved Monroe school found.');
    process.exit(1);
  }

  const createdUsers = [];
  for (const person of school.people) {
    let user = await User.findOne({ email: person.email });
    if (!user) {
      let firstName = person.name;
      let lastName = '.';
      if (person.name.includes(' ')) {
        const parts = person.name.split(' ');
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
      }
      user = new User({
        email: person.email,
        password: 'njyag',
        firstName,
        lastName,
        school: school.schoolName,
        role: mapRole(person.type)
      });
      await user.save();
      createdUsers.push(user.email);
      console.log(`Created user: ${user.email} (${user.role})`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }

  console.log('Done! Created users:', createdUsers);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 