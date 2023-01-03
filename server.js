const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
require('./auth')

// Middleware

function isLoggedin(req, res, next) {
    req.user ? next() : res.sendStatus(401)
}

const app = express()
app.use(session({
    secret: 'cats'
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(express.static('./Public'))
app.use(express.urlencoded({
    extended: false
}))
app.use(express.json())


app.post('/login.html', (req, res) => {
    console.log(req.body)
    res.status(200).send('Nice Bitch')
})

// Adding PassportJS Authentication :-

// Google
app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['email', 'profile']
    })
)

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/protected',
        failureRedirect: '/auth/failure'
    })
)

app.get('auth/failure', (req, res) => {
    res.status(400).json({
        status: 'failure',
        message: 'something went wrong...'
    })
})

app.get('/protected', isLoggedin, (req, res) => {
    res.sendFile(__dirname + '/public/authSucc.html')
    // res.send("Access Granted")
})

app.get('/logout', (req, res) => {
    req.logout(function (err) { 
        if (err) {
            return next(err);
        } 
        res.send('<html>You have successfully been logged out. Click <a href="/login.html">here</a> to go back to the login page.</html>')
    });
    
})

app.get('*', (req, res) => {
    res.status(404).send('<h1>ERROR 404</h1>')
})

app.listen(process.env.PORT, () => {
    console.log('server is running at http://localhost/login.html', process.env.PORT)
})