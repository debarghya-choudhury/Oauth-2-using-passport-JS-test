const mongoose = require('mongoose')

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
        type: [String],
        default: [],
    },
});

// Making the user model out of the Schema :-
module.exports = mongoose.model("user", userSchema, "users"); // Naming the collections as "users" in the 3rd argument