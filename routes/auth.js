const express= require('express');
const router= express.Router();
const {check, body}= require('express-validator/check');  //please go through github repositories for types of functions provided by the package.
const authController= require('../controllers/auth');
const User= require('../models/user');
router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.get('/reset', authController.getReset);
router.post(
'/login', 
[
    body('email')
    .isEmail()
    .withMessage('Please enter a valid Email Id.')
    .normalizeEmail()
    ,
    body('password', 'Please enter an alphanumeric password with length at least 5.')
    .isLength({min: 5})
    .isAlphanumeric()
    .trim()],
authController.postLogin);
router.post('/signup', 
    [check('email')
    .isEmail()
    .withMessage('Please enter a valid Email Id.')
    .custom((value, {req})=>{
        return User.findOne({email: value})
        .then(userDoc=>{
        if(userDoc){
            return Promise.reject('E-mail already exists, please pick a different one.')
        }
    })
    })
    .normalizeEmail(),
    body('password', 'Please enter an alphanumeric password with length at least 5.')
    .isLength({min: 5})
    .isAlphanumeric()
    .trim(),
    body('confirmPassword').custom((value, {req})=>{
        if(value!==req.body.password){//value is the value we get from the confirmPassword field of the form.
            throw new Error('Incorrect Password.');
        }
        return true;//means if the function makes up to here we can proceed further.
    })
    .trim()
    ]
, authController.postSignup);
router.post('/logout', authController.postLogout);
module.exports= router;