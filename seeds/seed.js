const sequelize = require('../config/connection');
const { User, Location } = require('../models');

const userData = require('./userData.json');
const locationData = require('./locationData.json');

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  const users = await User.bulkCreate(userData, {
    individualHooks: true,
    returning: true
  });

  // for (const location of locationData) {
  //   await Location.create({
  //     ...location,
  //     user_id: users[Math.floor(Math.random() * users.length)].id,
  //   });
  // }

  const locs = await Location.bulkCreate(locationData, {
    individualHooks: true,
    returning: true
  });

  const date = new Date();

  console.log('\n\n\x1b[33m ** Seeding complete at ' + date + ' ** \x1b[0m\n\n');

  process.exit(0);
};

seedDatabase();
