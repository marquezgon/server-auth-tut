const jwt = require('jwt-simple');
const config = require('../config');
const User = require('../models/user');

function tokenForUser(user) {
  const timestamp = new Date().getTime();

  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password) {
    return res.status(422).send({ error: 'You must provide an email and a password' });
  }

  //See if user with the given email exists
  User.findOne({ email: email }, function(err, existingUser) {
    if(err) { return next(err); }

    //If a user with email does exist, return an error
    if(existingUser) {
      return res.status(422).send({ error: 'Email already exists!' });
    }

    //If a user with email DOES NOT exist, create a save user record
    const user = new User({
      email: email,
      password: password
    });

    user.save()
      .then(() => {
        //Respond to request indicating the user was created
        res.json({ token: tokenForUser(user) });
      });
  });
}
