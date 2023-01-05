const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
require('./auth')

// requiring module
const User = require('./model/usermodel')


// view

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
    res.status(200).send('Success')
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
    })
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
    if (req.user && req.user.role === "admin") {
        res.sendFile(__dirname + '/public/admin-only-route.html')
    } else {
        res.send('Unauthorized')
    }

    // res.send("Access Granted")
})

app.get('/users-route', isLoggedin, (req, res) => {
    if (req.user && req.user.role === "User") {
        res.sendFile(__dirname + '/public/users-route.html')
    } else {
        res.send('Unauthorized')
    }
    // res.send("Access Granted")
})

// USER METHODS :-
app.get('/users-get', isLoggedin, async (req, res) => {
    try {
        const fetchedData = await User.find({
            google_id: req.user.google_id
        }, {
            name: 1,
            data: 1
        })
        res.status(200).json({
            success: true,
            data: {
                fetchedData
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'failure',
            message: 404
        })
    }
})

app.post('/users-post', isLoggedin, async (req, res) => {
    try {
        let {
            data
        } = req.body
        let singedUser = await User.updateOne({
            google_id: req.user.google_id
        }, {
            $push: {
                data: data
            }
        })
        // res.status(200).send('successfully posted')
        res.status(201).redirect('/users-route')
    } catch (error) {
        res.status(400).json({
            status: 'failure',
            message: 'Something went wrong...'
        })
    }
})

// ADMIN METHODS :- 
app.get('/admin-get', isLoggedin, async (req, res) => {
    try {
        const fetchedData = await User.find({}, {
            name: 1,
            data: 1
        })
        res.status(200).json({
            success: true,
            data: {
                fetchedData
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'failure',
            message: 404
        })
    }
})

app.post('/admin-post', isLoggedin, async (req, res) => {
    try {
        let {
            name,
            data,
            method
        } = req.body
        console.log(name, data, method)
        if (method === 'post') {
            // POST request
            let searchedUser = await User.updateOne({
                name: name
            }, {
                $push: {
                    data: data
                }
            })
            console.log(searchedUser)
            if (searchedUser.matchedCount === 0) {
                return res.sendStatus(404)
            }
            return res.status(201).redirect('/admin-only-route')

        } else if (method === 'update') {
            // UPDATE request
            let searchedUser = await User.updateOne({
                name: name
            }, {
                $set: {
                    data: data
                }
            })
            console.log(searchedUser)
            if (searchedUser.matchedCount === 0) {
                return res.sendStatus(404)
            }
            return res.status(201).redirect('/admin-only-route')

        } else if (method === 'delete') {
            // Delete the User itself from collection
            let searchedUser = await User.deleteOne({
                name: name
            })
            console.log(searchedUser)
            if (searchedUser.deletedCount === 0) {
                return res.sendStatus(404)
            }
            return res.status(201).redirect('/admin-only-route')
        }
        // res.send('success')
    } catch (error) {
        res.status(400).json({
            status: 'failure',
            message: 'Something went wrong...'
        })
    }
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