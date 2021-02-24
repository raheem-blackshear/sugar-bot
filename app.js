let express = require('express');
let session = require('express-session');
let path = require('path');
//let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let User = require('./js/dataAccess/models/users');
// let process.env.NODE_ENV= "development"
let index = require('./routes/index');
let users = require('./routes/users');
let industries = require('./routes/industries');
let states = require('./routes/states');
let search = require('./routes/search');
let register = require('./routes/register');
let projects = require('./routes/project');
let templates = require('./routes/template');
let dataSources = require('./routes/dataSources');
let stripePayment = require('./routes/stripePayment');
let projectList = require('./routes/projectList');
let payments = require('./routes/payments');
let integrations = require('./routes/integrations');
let passport = require('passport');
let Strategy = require('passport-http').BasicStrategy;

passport.use(new Strategy(
    function(emailAddress, password, done) {
        User.findOne({ emailAddress: emailAddress}, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done('failed', false); }
            if (!user.verifyThisUsersPassword(password)) { return done('failed', false); }
            return done(null, user);
        });
    }
));

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'asdflajsdjfasd8asdfa908asdfojkasddfljasd', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/api/users', users);
app.use('/api/industries',industries);
app.use('/api/states',states);
app.use('/api/search',search);
app.use('/api/register',register);
app.use('/api/project',projects);
app.use('/api/template',templates);
app.use('/api/dataSources',dataSources);
app.use('/api/stripePayment',stripePayment);
app.use('/api/projectList',projectList);
app.use('/api/payments',payments);
app.use('/api/integrations',integrations);

app.post('/login',
    passport.authenticate('basic', {session:false}),
    function(req, res) {
        console.log(req.user);
        User.findOne({emailAddress: req.user.emailAddress}).lean().then( result => {
            if(result.verified && result.active && !result.closed)
              res.json({emailAddress: req.user.emailAddress, id: req.user.id, fullName:result.fullname, role: result.role, credit: req.user.credit});
            else if(result.closed)
              res.status(400).json({message: "Your account is now closed."});
            else if(!result.verified)
              res.status(400).json({message: "Please verify your account by clicking the link in your email."});
            else if(!result.active)
              res.status(400).json({message: "Your account is now inactive. Please contact administrator."});
            else
              res.status(400).json({message: "Incorrect user name or password."});
        });

    });

app.get('/logout',
    passport.authenticate('basic', {session:false}),
    function(req, res){
        req.logout();
        res.status(301).json({message: "remove your cookies!"});
    });


app.get('/*', function (req, res) {
    res.sendFile("index.html", {root: __dirname + '/public'});
});
app.use(express.static('public'))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
