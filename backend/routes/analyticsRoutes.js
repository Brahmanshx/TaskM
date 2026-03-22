const express = require('express');
const router = express.Router();
const { getProductivity, getStreaks } = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/productivity', getProductivity);
router.get('/streaks', getStreaks);

module.exports = router;
