// ============================================
// IMPORTS
// ============================================
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const session = require("express-session");
const flash =require("connect-flash");




// const listing = require('./models/listing');
// const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
// const { listingSchema, reviewSchema } = require('./schema');
// const Review = require('./models/review');
const listings=require('./routes/listing');
const sessionOptions={
    secret:"myspscrt",
    resave:false,
    saveUninitialized:true,
    cookies:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    },
};






// EXPRESS SETUP

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

// Middleware
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error = req.flash("error");
    next();
});




app.use('/listings', listings);




//database connection
async function main() {
    await mongoose.connect('mongodb://localhost:27017/wanderlust');
    console.log('Connected to MongoDB');
}

main().catch(err => console.error(err));






app.get('/', (req, res) => {
    res.redirect('/listings');
});












//ERROR HANDLING


// // none of the routes matched , so we will create a custom error and pass it to the error handling middleware
app.all(/.*/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Global error handling middleware
app.use((err, req, res, next) => {
    let { message = 'Something went wrong', statusCode = 500 } = err;

    res.status(statusCode).render('Error.ejs', { message, statusCode });
});







//start the server
app.listen(8080, () => {
    console.log('Server is running on port 8080');
});

