const path = require('path');
const fs = require('fs');
const router = require('express').Router();
const { Location, User } = require('../models');
const withAuth = require('../utils/auth');


router.get('/js/profile.js', (req, res) => {
  // Note that the profile.js file actually resides at views/profile.js rather than in
  // public/js/profile.js.  This is because the existence of that file in the public folder
  // was taking precedence over this route, and moving the file resolved that issue.
  // Having moved the file, the path.join() call below must reflect the *actual* location of the
  // file; thus the reference to 'views'.  Note, however, that any requesting client can 
  // continue to function AS IF the file still resides in the public folder.
  fs.readFile(path.join(__dirname, '..', 'views', 'profile.js'), 'utf8', function (err, data) {
    if (err) {
      console.log('\n\nerr on read of profile.js **\n\n');
      res.status(400).json(err);
    } else {
      // Having successfully retrieved the file's contents, make the replacement below, causing
      // the actual API key to be in the response rather than the literal 'BING_API_KEY'.
      scriptContent = data.replace('BING_API_KEY', process.env.BING_API_KEY);
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

router.get('/logout', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/login');
    return;
  }
  res.render('login', {
    api_key: process.env.BING_API_KEY
  });
});

module.exports = router;
