const express = require('express');
const router = express.Router();



const listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');

const { listingSchema, reviewSchema } = require('../schema');
const Review = require('../models/review');





// VALIDATION MIDDLEWARE

const validateId = (req, res, next) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ExpressError('Invalid listing ID', 400);
    }
    next();
};

const validateListing = (req, res, next) => {
    let result = listingSchema.validate(req.body);

    if (result.error) {
        throw new ExpressError(result.error.details[0].message, 400);
    }
    next();
}

const validateReview = (req, res, next) => {
    let result = reviewSchema.validate(req.body);

    if (result.error) {
        throw new ExpressError(result.error.details[0].message, 400);
    }
    next();
}






// ============================================
// ROUTES
// ============================================



// LISTINGS - CREATE


// Render form to create new listing
router.get('/new', (req, res) => {
    res.render('listings/new.ejs');
});

// Route to handle form submission and create a new listing, save it and back to main page
router.post('/', validateListing, wrapAsync(async (req, res) => {


    const { title, description, price, image, location, country } = req.body;
    const newListing = new listing({ title, description, price, image, location, country });
    await newListing.save();
    req.flash("success", "New listing created");
    res.redirect('/listings');
}));






// LISTINGS - READ


// Display all listings
router.get('/', wrapAsync(async (req, res) => {
    const allListings = await listing.find({});
    res.render('listings/index.ejs', { allListings });
}));


// Display  specific listing details
router.get('/:id', validateId, wrapAsync(async (req, res) => {
    const { id } = req.params;

    const Listing = await listing.findById(id).populate('reviews');

    // Check if listing exists
    if (!Listing) {
        // throw new ExpressError('Listing not found', 404);
        req.flash("error", "listing you requested for does not exists");
        res.redirect("/listings");
    } else {
        res.render('listings/show.ejs', { Listing });
    }

}));




// LISTINGS - UPDATE


// Render form to edit existing listing
router.get('/:id/edit', validateId, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listingToEdit = await listing.findById(id);
    res.render('listings/edit.ejs', { listingToEdit });
}));

// Route to handle form submission and update the listing, save it and back to main page
router.put('/:id', validateId, validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;

    const { title, description, price, image, location, country } = req.body;
    await listing.findByIdAndUpdate(id, { title, description, price, image, location, country });
    req.flash("success", "listing updated!");
    res.redirect('/listings');
}));




// LISTINGS - DELETE


// Delete existing listing
router.delete('/:id', validateId, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedListing = await listing.findByIdAndDelete(id);

    if (!deletedListing) {
        throw new ExpressError('Listing not found', 404);
    }
    req.flash("success", "listing deleted!");

    res.redirect('/listings');
}));



//post reviews for listings

router.post('/:id/reviews', validateId, validateReview, wrapAsync(async (req, res) => {


    let { id } = req.params;
    let Listing = await listing.findById(id);
    if (!Listing) {
        throw new ExpressError('Listing not found', 404);
    }
    let { review } = req.body;

    let newReview = new Review({ comment: review.comment, rating: review.rating });
    await newReview.save();

    Listing.reviews.push(newReview);
    await Listing.save();
    req.flash("success", "Review created!");

    res.redirect(`/listings/${id}`);


}));



module.exports = router;    


