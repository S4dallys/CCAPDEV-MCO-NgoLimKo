const express = require('express');
const router = express.Router()
const query = require('../utility/query');
const error = require("../utility/error")
const bcrypt = require("bcrypt")
const passport = require('passport');

router.post('/register', async (req, res) => {
    try {
        const { username, password, confirm_password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)

        // do error checking
        // ...

        await query.insertProfle({
            name: username,
            password: hashedPassword
        })

        console.log(`REGISTER SUCCESSFUL!\nU: ${username}\nP: ${password}`)
        res.redirect("/")
    } catch (err) {
        // ...
        res.render("error", { message: err.message })
    }
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/error',
}))

router.get('/login', async(req, res) => {
    const username = req.query.username
    const password = req.query.password
    const user = await query.getProfile({ name: username })

    if (!user) {
        res.send({ success: false })
        return
    }

    try {
        if (await bcrypt.compare(password, user.password)) {
            res.send({ success: true })
        } else {
            res.send({ success: false })
        }
    } catch(err) {
        res.send({ success: false })
    }
})

router.get('/logout', (req, res) => {
    req.logOut((err) => {
        console.log(err)
    })
    res.redirect('/')
})

router.get('/register', async (req, res) => {
    const results = await query.getProfile({ name: req.query.username })
    res.send({
        exists: (results) ? true : false
    })
})

module.exports = router
