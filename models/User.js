const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String},
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
