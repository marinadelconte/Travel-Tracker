const router = require('express').Router();
const { Location } = require('../../models');
const withAuth = require('../../utils/auth');



router.get('/', withAuth, async (req, res) => {
  // console.log("hello");
  console.log('\x1b[33mlocationRoutes get / entry point');
  try {
    console.log('\x1b[33mlocationRoutes get / req.session.user_id = ', req.session.user_id, '\x1b[0m');
    console.log('\x1b[33mlocationRoutes get / type of req.session.user_id = ', typeof req.session.user_id, '\x1b[0m');
    const locationData = await Location.findAll({
      where: {user_id: req.session.user_id},
      // include: [
      //   {
      //     model: User,
      //     attributes: ['name'],
      //   },
      // ],
    });
    // console.log(locationData)
    console.log('\x1b[33mlocationRoutes get / locationData = ', locationData, '\x1b[0m');
    res.status(200).json(locationData);
  } catch (err) {
    res.status(400).json(err);
  }
});
router.post('/', withAuth, async (req, res) => {
  try {
    const newLocation = await Location.create({
      ...req.body,
      user_id: req.session.user_id,
    });

    res.status(200).json(newLocation);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id', withAuth, async (req, res) => {
  try {
    const locationData = await Location.destroy({
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });

    if (!locationData) {
      res.status(404).json({ message: 'No location found with this id!' });
      return;
    }

    res.status(200).json(locationData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
