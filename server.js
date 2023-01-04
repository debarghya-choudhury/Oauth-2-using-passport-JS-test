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
    secret: 'authentication'
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(express.static('./Public'))
app.use(express.urlencoded({
    extended: false
}))
app.use(express.json())


app.get('/', (req, res) => {
    res.redirect('/login.html')
})

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
            successRedirect: '/check-auth',
            failureRedirect: '/auth/failure'
        }
    )
)

app.get('auth/failure', (req, res) => {
    res.status(400).json({
        status: 'failure',
        message: 'something went wrong...'
    })
})

// Checking if the login is from admin or user, then redirecting to their specific urls
app.get('/check-auth', (req, res) => {
    // console.log(req.user)
    if (req.user && req.user.role === "admin") {
        res.redirect('/admin-only-route')
    } else {
        res.redirect('/users-route')
    }
})

app.get('/admin-only-route', isLoggedin, (req, res) => {
    res.sendFile(__dirname + '/public/admin-only-route.html')
    // res.send("Access Granted")
})

app.get('/users-route', isLoggedin, (req, res) => {
    res.sendFile(__dirname + '/public/users-route.html')
    // res.send("Access Granted")
})

app.get('/users-get', isLoggedin, (req, res) => {
    res.status(200).send('users-get route working')
})

app.post('/users-post', isLoggedin, (req, res) => {
    res.status(200).send('users-post route working')
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
    console.log('server is running at http://localhost/')
})