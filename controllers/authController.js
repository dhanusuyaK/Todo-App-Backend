const jwt = require('jsonwebtoken');
const passport = require('passport');

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// exports.googleAuthCallback = (req, res, next) => {
//   passport.authenticate('google', { session: false }, (err, user) => {
//     if (err || !user) return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
//     const token = generateToken(user);
//     console.log('Generated JWT Token',token);
//     // Send token to frontend as query param or cookie (here we redirect with token in query)
//     res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
//   })(req, res, next);
// };

exports.googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      }
  
      const token = generateToken(user);
      console.log('Generated JWT Token:', token);
  
      // Redirect with token in query string to frontend dashboard
      //return res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
      return res.redirect(`${process.env.FRONTEND_URL}/oauth2/redirect?token=${token}`);
    })(req, res, next);
  };
  