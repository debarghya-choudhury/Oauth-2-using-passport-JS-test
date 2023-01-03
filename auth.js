require('dotenv').config()
const passport = require('passport')
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
      console.log(accessToken, refreshToken, profile, done)
      return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
    done(null, user)
})

passport.deserializeUser(function(user, done) {
    done(null, user)
})

// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const mongoose = require('mongoose');

// // Create a Mongoose model for the User object
// const UserSchema = new mongoose.Schema({
//   googleId: String,
//   name: String,
//   email: String
// });
// const User = mongoose.model('User', UserSchema);

// passport.use(new GoogleStrategy({
//     clientID:     process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://localhost/auth/google/callback",
//     passReqToCallback   : true
//   },
//   function(request, accessToken, refreshToken, profile, done) {
//     // Search for an existing user with the given googleId
//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       if (err) return done(err);

//       // Create a new user object from the profile
//       const user = new User({
//         googleId: profile.id,
//         name: profile.name,
//         email: profile.email
//       });

//       // Save the user to the database
//       user.save(function(err) {
//         if (err) return done(err);
//         return done(null, user);
//       });
//     });
//   }
// ));