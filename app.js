// ============================================
// IMPORTS
// ============================================
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const listing = require('./models/listing');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');

const listingSchema = require('./schema');


// ============================================
// EXPRESS SETUP
// ============================================
const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

// Middleware
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// DATABASE CONNECTION
// ============================================
async function main() {
    await mongoose.connect('mongodb://localhost:27017/wanderlust');
    console.log('Connected to MongoDB');
}

main().catch(err => console.error(err));


// ============================================
// VALIDATION MIDDLEWARE
// ============================================
const validateId = (req, res, next) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ExpressError('Invalid listing ID', 400);
    }
    next();
};

const validateListing = (req, res, next) => {
    let result=listingSchema.validate(req.body);

    if (result.error) {
        throw new ExpressError(result.error.details[0].message, 400);
    }
    next();
}


// ============================================
// ROUTES
// ============================================

// Home route
app.get('/', (req, res) => {
    res.send('hi route is working');
});


// ============================================
// LISTINGS - CREATE
// ============================================

// Render form to create new listing
app.get('/listings/new', (req, res) => {
    res.render('listings/new.ejs');
});

// Route to handle form submission and create a new listing, save it and back to main page
app.post('/listings', validateListing, wrapAsync(async (req, res) => {

    
    const { title, description, price, image, location, country } = req.body;
    const newListing = new listing({ title, description, price, image, location, country });
    await newListing.save();
    res.redirect('/listings');
}));


// ============================================
// LISTINGS - READ
// ============================================

// Display all listings
app.get('/listings', wrapAsync(async (req, res) => {
    const allListings = await listing.find({});
    res.render('listings/index.ejs', { allListings });
}));

// Display listing details
app.get('/listings/:id', validateId, wrapAsync(async (req, res) => {
    const { id } = req.params;

    const Listing = await listing.findById(id);

    // Check if listing exists
    if (!Listing) {
        throw new ExpressError('Listing not found', 404);
    }

    res.render('listings/show.ejs', { Listing });
}));





// ============================================
// LISTINGS - UPDATE
// ============================================

// Render form to edit existing listing
app.get('/listings/:id/edit', validateId, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listingToEdit = await listing.findById(id);
    res.render('listings/edit.ejs', { listingToEdit });
}));

// Route to handle form submission and update the listing, save it and back to main page
app.put('/listings/:id', validateId, validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;

    const { title, description, price, image, location, country } = req.body;
    await listing.findByIdAndUpdate(id, { title, description, price, image, location, country });
    res.redirect('/listings');
}));


// ============================================
// LISTINGS - DELETE
// ============================================

// Delete existing listing
app.delete('/listings/:id', validateId, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));



// ============================================
// ERROR HANDLING
// ============================================

// none of the routes matched , so we will create a custom error and pass it to the error handling middleware
app.all(/.*/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Global error handling middleware
app.use((err, req, res, next) => {
    let { message = 'Something went wrong', statusCode = 500 } = err;

    // Log error for debugging
    console.error(err);

    res.status(statusCode).render('error.ejs', { message, statusCode });
});








// ============================================
// SERVER START
// ============================================
app.listen(8080, () => {
    console.log('Server is running on port 8080');
});











