require('dotenv').config()
const mongoose = require('mongoose')
const passport = require('passport')
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

mongoose.connect('http://mongodb:27017/auth-api', () => {
    console.log("DB Connected")
})

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    //   console.log(accessToken, refreshToken, profile, done)
      // Checking the Google ID of the authenticated user to see if they are an admin
      if (profile.id === process.env.ADMIN_GOOGLE_ID) {
        profile.role = "admin";
      } else {
        profile.role = "normal";
      }
      return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
    done(null, user)
})

passport.deserializeUser(function(user, done) {
    done(null, user)
})

