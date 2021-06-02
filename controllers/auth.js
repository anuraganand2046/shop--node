const User = require('../models/user');
const bcrypt= require('bcryptjs');
const {validationResult}= require('express-validator/check');
exports.getLogin = (req, res, next) => {
  let message= req.flash('error');
  if(message.length) message= message[0];
  else message= null;
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {email: "", password: "", confirmPassword: ""},
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  let message= req.flash('error');
  if(message.length) message= message[0];
  else message= null;
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {email: "", password: "", confirmPassword: ""},
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
    const email= req.body.email;
    const password= req.body.password;
    const errors= validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errors.array()[0].msg,
        oldInput: {email: email, password: password},
        validationErrors: errors.array()
      })
    } 
    User.findOne({email: email})
    .then(user => {
      if(!user){
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'This Email Id is not registered with us.',
            oldInput: {email: email, password: password},
            validationErrors: [{param: 'email'}]
          })
      }
      bcrypt.compare(password, user.password)//if they match or don't match we always get a boolean.It is true if they matches otherwise false.
      .then(doMatch=>{
          if(doMatch){
            req.session.isLoggedIn = true;//whole idea is here---> that is we simply set isLoggedIn==true and assign the session to the current user.This ensures that all the request by this user is taken as a whole.Req must not be independent of the user.
            req.session.user = user;
            return req.session.save(err => {//saving the session
                console.log(err);
                res.redirect('/');
        });
          }
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Wrong Password',
            oldInput: {email: email, password: password},
            validationErrors: [{param: 'password'}]
          })
      })
      .catch(err=>{
          console.log(err);
          res.redirect('/login');
      })
    })
    .catch(err =>{
      const error= new Error(err);
      error.httpStatusCode= 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {//It also checks if the given email id is already registered.
    const email= req.body.email;
    const password= req.body.password;
    const confirmPassword= req.body.confirmPassword;
    const errors= validationResult(req);//there the check function analyzes the req and here the error appears any in the validationResult.
    if(!errors.isEmpty()){//means that the error field is not empty.
      console.log(errors.array()[0].msg);//Means the validator does the job of checking the uniqueness of the email id.
      return res.status(422).render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: errors.array()[0].msg,
        oldInput: {email: email, password: password, confirmPassword: confirmPassword},
        validationErrors: errors.array()
      });//we do not redirect as it is a failure.
    }
      return bcrypt.hash(password, 12)
        .then(hashedPassword=>{
            const user= new User({
                email: email,
                password: hashedPassword,
                cart: {items: []}
            })
            return user.save();
        })
    .then((result)=>{
        res.redirect('/login');
    })
    .catch(err=> {
      const error= new Error(err);
      error.httpStatusCode= 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
exports.getReset= (req, res, next)=>{
  let message= req.flash('error');
  if(message.length) message= message[0];
  else message= null;
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    });
}
//express-session helps to maintain the session of the current user.


//payload