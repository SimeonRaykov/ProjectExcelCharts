const express = require('express');
const {
    db
} = require('./db');
const bodyParser = require('body-parser');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const username = require('./routes/dashboard').getUsername;
// Passport config   
require('./config/passport.js')(passport);
// EJS     
app.set('views', path.join(__dirname, 'views')); // add this one, change 'views' for your folder name if needed.
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Make bootstrap / ejs work with js and datable files
app.use(express.static('public'), express.static(__dirname + '/static'))
// Bodydparser 
app.use(express.json({
    limit: '50mb'
}));
var jsonParser = bodyParser.json({
    limit: 1024 * 1024 * 20,
    type: 'application/json'
});
app.use(bodyParser.json({
    limit: '500mb'
}));
app.use(bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 500000
}));

var urlencodedParser = bodyParser.urlencoded({
    extended: true,
    limit: 1024 * 1024 * 20,
    type: 'application/x-www-form-urlencoded'
})

app.use(jsonParser);
app.use(urlencodedParser);

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    //  cookie: {secure: true}
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

const datavendPort = '192.168.1.113';

// PORT 
const PORT = process.env.PORT || 3000;
app.listen(PORT, datavendPort, console.log(`Server started on port ${PORT}`));
app.disable('view cache');
const nocache = require('nocache');
app.use(nocache());
app.set('etag', false)
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    next()
})

//  Routing
app.use('/', require('./routes/dashboard'));
app.use('/users', require('./routes/users'));
app.use('/homepage', require('./routes/dashboard'));
app.use('/users', require('./routes/dashboard'));

//  Imports - Menu
app.use(require('./API-controllers/imports/import-daily-hour-readings-api'));
app.use(require('./API-controllers/imports/import-hour-readings-api'));
app.use(require('./API-controllers/imports/import-stp-readings-api'));
app.use(require('./API-controllers/imports/import-stp-hour-readings-api'));
app.use(require('./API-controllers/imports/import-stp-hour-predictions-api'));
app.use(require('./API-controllers/imports/import-graphs-api'));
app.use(require('./API-controllers/imports/import-profiles-api'));
app.use(require('./API-controllers/imports/import-hour-readings-eso-api'));
app.use(require('./API-controllers/imports/import-exchange-prices-api'));

//  Clients - Menu
app.use(require('./API-controllers/clients/clients-menu-table-api'));
app.use(require('./API-controllers/clients/clients-groups-api'));
app.use(require('./API-controllers/clients/clients-info-page-api'));
app.use(require('./API-controllers/clients/clients-eso-info-page-api'));

//  Readings - Menu 
app.use(require('./API-controllers/readings/list-readings-stp-api'));
app.use(require('./API-controllers/readings/list-hour-readings-api'));
app.use(require('./API-controllers/readings/list-eso-hour-readings-api'));
app.use(require('./API-controllers/readings/list-eso-hour-readings-daily-api'));

//  Graphs - Menu
app.use(require('./API-controllers/graphs/list-graph-stp-readings-api'));
app.use(require('./API-controllers/graphs/list-graph-readings-api'));
app.use(require('./API-controllers/graphs/graph-hour-predictions-daily-api'));

//  Profiles - Menu
app.use(require('./API-controllers/profiles/profiles-api'));

//  Invoices
app.use(require('./API-controllers/invoices/stp-list-readings-api'));
app.use(require('./API-controllers/invoices/stp-list-clients-details-api'));
app.use(require('./API-controllers/invoices/stp-reading-details-api'));
app.use(require('./API-controllers/invoices/hourly-list-readings-api'));

//  Exchange-prices
app.use(require('./API-controllers/exchange-prices/list-exchange-prices-api'));
app.use(require('./API-controllers/exchange-prices/exchange-prices-daily-api'));

//  Inquiry
app.use(require('./API-controllers/inquiry/inquiry-readings-api'));
app.use(require('./API-controllers/inquiry/inquiry-graphs-api'));
app.use(require('./API-controllers/inquiry/inquiry-imbalances-api'));
app.use(require('./API-controllers/inquiry/inquiry-missing-information-api'));

//  404 Not Found
app.get('*', (req, res) => res.render('./handle-errors/404-not-found.ejs', {
    name: username
}));

exports.db = db;