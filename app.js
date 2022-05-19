
//https://shop--node.herokuapp.com/products?page=1   <---link to hosted application.

//motto: never give up.
const express= require('express');
const https= require('https');
const fs= require('fs');
const mongoose= require('mongoose');
const path= require('path');
const bodyParser= require('body-parser');
const session= require('express-session');
const adminRoutes= require('./routes/admin');
const mongoDBStore= require('connect-mongodb-session')(session);
const shopRoutes = require('./routes/shop');
const multer= require('multer');
const authRoutes= require('./routes/auth');
const helmet= require('helmet');
const compression= require('compression');
const morgan= require('morgan');
const csrf= require('csurf');
const flash= require('connect-flash');
const MONGODB_URI= `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.cfmoi.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;//-?environment variable required
//{process} gives access to env variables.Hence now we can set these values from outside without deploying the application again.
const errorController= require('./controllers/error');
const User= require('./models/user');
const app= express();
const accessLogStream= fs.createWriteStream(
    path.join(__dirname, "access.log"),
    {flags: "a"});//flags="a" means the data is appended but not overwritten.
app.set('view engine', 'ejs');
//hey express use this engine to convert data into dynamic template.
app.set('views', 'views');
app.use(helmet());//this is it.No many headers are set for security purposes.
app.use(compression());//this lets u download the smaller version of the html, css and javascript pages on the browser and browser does rest of the work.
app.use(morgan('combined', {stream: accessLogStream}));//it will print the logging data.So we can save all of em.
//{stream: accessLogStream} means that the stream that returns from the morgan will be written on accessLogStream.

//logging in using morgan is just to know what is going on the web application.When it will be deployed many users will be using our app and we must ensure that there is no malfunctioning


//this is where u will get the data.
const store= new mongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection= csrf();
const fileStorage= multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'images');
    },
    filename: (req, file, cb)=>{
        cb(null, new Date().toISOString()+'-'+file.originalname);
    }
});

const fileFilter=(req, file, cb)=>{
    if(file.mimetype=='image/png'||file.mimetype=='image/jpg'||file.mimetype=='image/jpeg') cb(null, true);
    else cb(null, false);
}

// const privateKey= fs.readFileSync('server.key');
// const certificate= fs.readFileSync('server.cert');//ssl certificate that allows encryption.

app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));//statically serving 'public file.
//path.join(__dirname)-> it avails the url required before 'public'.
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
    secret: 'anurag anand',
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next)=>{
    res.locals.isAuthenticated= req.session.isLoggedIn;
    res.locals.csrfToken= req.csrfToken();
    next();
});
app.use((req, res, next)=>{
    if(!req.session.user) return next(); //means if the user is not defined, it is not possible to check his ID.
    User.findById(req.session.user._id)
    .then(user =>{
        if(!user) return next();
        req.user= user;
        next();
    })
    .catch(err=>{
        next(new Error(err)); //express validator has a way to control this type of error.
    });
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500', errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next)=>{
    res.status(500).render('500',{
        pageTitle: 'Error',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
});
mongoose.connect(MONGODB_URI).then(result=>{
    //  https.createServer({key: privateKey, cert: certificate}, app).listen(process.env.PORT||3000);
     //->environment variable required-----> the hosting provider will check for the process.env.port and if filled they will use that one as port.Otherwise 3000 is good.
    app.listen(process.env.PORT||3000);
}).catch(err=>console.log(err));
//https=http+secure.HTTPS is the HTTP(primary protocol used to send data between a web browser and a website.) protocol over TLS/SSL.Every website nowadays should use https rather than http.
// HTTPS eliminates the ability of unmoderated third parties to inject advertising into web content.

//nodemon.js->this complete folder is to store the values of environmental keys
//node_env=production lets the hosting app to change certain properties of the our application so that there is more security and smoothness as it comes to know that the application is meant for production purpose.
//Helmet helps you secure your Express apps by setting various HTTP headers





//openssl req -nodes -new -x509 -keyout server.key -out server.cert-> lets us create a server cent and server key file that will contain public.private key and hence implement ssl.

//SSL certificates are what enable websites to move from HTTP to HTTPS, which is more secure. 
//An SSL certificate is a data file hosted in a website's origin server. SSL certificates make SSL/TLS encryption possible, and they contain the website's public key and the website's identity, along with related information. 
//Devices attempting to communicate with the origin server will reference this file to obtain the public key and verify the server's identity.
//The private key is kept secret and secure.


//git->b=version control.

//brew tap heroku/brew && brew install heroku-to install heroku.


//Procfile->heroku specific.    web: node app.js->means the heroku will listen to app.js when it asked to deploy.
//.gitignore->name of file which should not be deployed at all.as every hosting provider do install all the node modules after deploying the app.


//random changes from feature
//more changes


=======
//I am at feature3
