const path = require('path');
const fs = require('fs');
const router = require('express').Router();
const { Location, User } = require('../models');
const withAuth = require('../utils/auth');

//update project to location - MD

router.get("/test", async (req, res) => {
  res.render('test', {
    api_key: process.env.BING_API_KEY
  });
});

router.get('/js/profile.js', (req, res) => {
  console.log('\x1b[33m get /js/profile.js ... \x1b[0m');
  console.log('__dirname = ', __dirname);
  fs.readFile(path.join(__dirname, '..', 'views', 'profile.js'), 'utf8', function (err, data) {
    if (err) {
      console.log('\n\nerr on read of profile.js **\n\n');
      res.status(400).json(err);
    } else {
      console.log('\x1b[33mdata from js = ', data, '\x1b[0m');
      scriptContent = data.replace('BING_API_KEY', process.env.BING_API_KEY);
      console.log('\x1b[33mscriptContent after = ', scriptContent, '\x1b[0m');
      res.setHeader('content-type', 'application/javascript');
      res.status(200).send(scriptContent);
    }
  });
});

router.get('/', async (req, res) => {
  try {
    // Get all locations and JOIN with user data
    const locationData = await Location.findAll({
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });

    // Serialize data so the template can read it
    const locations = locationData.map((location) => location.get({ plain: true }));
    // const locations = location.get({ plain: true })
    // console.log(locations)
    console.log('\x1b[33mhomeRoutes get / locations = ', locations, '\x1b[0m');
    // Pass serialized data and session flag into template

    res.render('homepage', { 
      locations, 
      logged_in: req.session.logged_in, 
      api_key: process.env.BING_API_KEY
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// get location by id/ doesnt work/ commenting out and will remove if not needed- cyndi

// router.get('/location/:id', async (req, res) => {
//   try {
//     const locationData = await Location.findByPk(req.params.id, {
//       include: [
//         {
//           model: User,
//           attributes: ['name'],
//         },
//       ],
//     });

//     const location = locationData.get({ plain: true });

//     res.render('profile', {
//       ...location,
//       logged_in: req.session.logged_in
//     });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// Use withAuth middleware to prevent access to route

router.get('/profile', withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Location }],
    });
    const user = userData.get({ plain: true });
    // console.log(user)
    console.log('\x1b[33mhomeRoutes get /profile user = ', user, '\x1b[0m');
    res.render('profile', {
      ...user,
      logged_in: true,
      api_key: process.env.BING_API_KEY
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/profile');
    return;
  }

  res.render('login', {
    api_key: process.env.BING_API_KEY
  });
});

module.exports = router;
