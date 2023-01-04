require('dotenv').config()
const mongoose = require('mongoose')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;

// Connecting to DATABASE :-
mongoose.connect('mongodb://localhost:27017/auth-api', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("DB Connected")
}).catch(err => console.log(err))


// Making a schema :=
const userSchema = mongoose.Schema({
    google_id: {
        type: String,
        unique: true,
    },
    name: String,
    picture: String,
    email: String,
    email_verified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'User'
    },
    data: {
        type: String,
        default: "null",
    },
});

// Making the user model out of the Schema :-
const User = mongoose.model("user", userSchema, "users"); // Naming the collections as "users" in the 3rd argument


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
                    });
                    newUser.save((err) => {
                        if (err) return cb(err);
                        return done(null, newUser);
                    });
                    console.log(newUser)
                    console.log("newUser has been added")
                }
            })
        }
    )
);

passport.serializeUser((user, cb) => {
    // This function is called when the user object needs to be serialized (e.g. for storing in a session)
    cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
    // This function is called when the user object needs to be deserialized (e.g. for retrieving from a session)
    User.findById(id, (err, user) => {
        if (err) return cb(err);
        cb(null, user);
    });
});

