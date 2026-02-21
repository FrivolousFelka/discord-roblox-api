require('dotenv').config();
const mongoose = require('mongoose');


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error', err));


const robloxUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  uid:      { type: String, default: null }, 
}, {
  timestamps: true 
});


const RobloxUser = mongoose.model('RobloxUser', robloxUserSchema);


module.exports = { RobloxUser };