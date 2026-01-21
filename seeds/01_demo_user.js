const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Check if demo user already exists
  const existingUser = await knex('user')
    .where({ email: 'demo@cryptobud' })
    .first();

  // Only insert if demo user doesn't exist
  if (!existingUser) {
    const hashedPassword = bcrypt.hashSync('demo123', 12);

    await knex('user').insert({
      first_name: 'Demo',
      last_name: 'User',
      email: 'demo@cryptobud',
      password: hashedPassword,
      avatar_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg',
      city: 'San Francisco',
      country: 'USA'
    });

    console.log('Demo user created successfully!');
    console.log('Email: demo@cryptobud');
    console.log('Password: demo123');
  } else {
    console.log('Demo user already exists.');
  }
};
