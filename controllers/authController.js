const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
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
  

  // Manual signup
  exports.signup = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
      });
  
      await newUser.save();
  
      const token = generateToken(newUser);
  
      return res.status(201).json({ token });
    } catch (error) {
      console.error('Signup error:', error);  // <-- log entire error
      return res.status(500).json({ message: 'Server error during signup' });
    }
  };
  

// Manual login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};