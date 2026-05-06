const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require("../auth");
const { errorHandler } = require("../auth");

module.exports.registerUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).send({ message: 'Email, Username and Password are required' });
    }
    if (!email.includes("@")) {
      return res.status(400).send({ message: 'Invalid email format' });
    }
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      return res.status(409).send({ message: 'Email/Username already registered' });
    }
    const newUser = new User({
      email,
      username,
      password: bcrypt.hashSync(password, 10)
    });
    const result = await newUser.save();
    return res.status(201).send({
      message: 'Registered successfully'
    });

  } catch (err) {
    return errorHandler(err, req, res);
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: 'Email, Username and Password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ message: 'Incorrect email or password' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).send({ message: 'Incorrect email or password' });
    }

    return res.status(200).send({
      access: auth.createAccessToken(user)
    });

  } catch (err) {
    return errorHandler(err, req, res);
  }
};

module.exports.getProfile = (req, res) => {
  if(!req.user || !req.user.id) {
    return res.status(401).send({message: 'Error while fetching user details'});
  }

  return User.findById(req.user.id)
  .select('-password')
  .then(user => {
    if (!user){
      return res.status(404).send({ message: 'User not found' })
    } 
    res.status(200).send({ user: user
    });
  })
  .catch(err => errorHandler(err, req, res));
};