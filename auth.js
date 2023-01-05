require('dotenv').config()
const mongoose = require('mongoose')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;

// Connecting to LOCAL DATABASE for Testing:-
// mongoose.connect('mongodb://localhost:27017/auth-api').then(() => {
//     console.log("DB Connected")
// }).catch(err => console.log(err))

// Connecting to CLOUD DATABASE Atlas:-
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB).then(con => {
    // console.log(con.connections)
    console.log('DB connection successful!')
}).catch(err => console.log(err))

// requiring module
const User = require('./model/usermodel')

passport.use(
    new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost/auth/google/callback",
            passReqToCallback: true,
        },
        function (request, accessToken, refreshToken, profile, done) {
            if (profile.id === process.env.ADMIN_GOOGLE_ID) {
                profile.role = 'admin'
            }
            User.findOne({
                google_id: profile._json.sub
            }, (err, user) => {
                if (err) return done(err)
                if (user) {
                    // If the user is found, return the user object
                    return done(null, user);
                } else {
                    const newUser = new User({
                        google_id: profile._json.sub,
                        name: profile._json.name,
                        picture: profile._json.picture,
                        email: profile._json.email,
                        email_verified: profile._json.email_verified,
                        role: profile.role,
                    })
                    newUser.save((err) => {
                        if (err) return cb(err);
                        return done(null, newUser);
                    })
                    console.log(newUser)
                    console.log("newUser has been added")
                }
            })
        }
    )
);

passport.serializeUser((user, cb) => {
    // This function is called when the user object needs to be serialized (e.g. for storing in a session)
    cb(null, user.id)
});

passport.deserializeUser((id, cb) => {
    // This function is called when the user object needs to be deserialized (e.g. for retrieving from a session)
    User.findById(id, (err, user) => {
        if (err) return cb(err);
        cb(null, user)
    });
});

