const express = require('express');
const passport = require('passport');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    //如果出現故障 請重新定向至login 如果出現故障 請 flash 抱歉 並顯示故障訊息
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout);

//router.get('/register', users.renderRegister);
//router.post('/register', catchAsync(users.register));

//router.get('/login', users.renderLogin);
//如果出現故障 請重新定向至login 如果出現故障 請 flash 抱歉 並顯示故障訊息
//router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);



module.exports = router;