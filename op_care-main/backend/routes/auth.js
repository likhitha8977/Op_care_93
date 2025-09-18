const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const passport = require('passport');


// Local auth
router.post('/signup', signup);
router.post('/login', login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/signin', session: false }), (req, res) => {
	// On success, send JWT and user info to frontend
	// You may want to redirect or send JSON
	res.redirect('/'); // Or send token/user info
});

module.exports = router;
