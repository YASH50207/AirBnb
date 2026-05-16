

const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: {
    type: String,
    required: true,
  },
    description: {
    type: String,
    required: true,
  },
    price: {
    type: Number,
    required: true,
  },
    image: {
    type: String,
    default: "https://images.unsplash.com/photo-1775563622936-2bac8f284416?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    set: (url) => url === "" ? "https://images.unsplash.com/photo-1775563622936-2bac8f284416?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : url,
    required: true,
  },
   location: {
    type: String,
    required: true,
  },
    country: {
    type: String,
    required: true,
  },
    reviews: {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Review',
    }
    
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;