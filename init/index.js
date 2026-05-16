const mongoose = require('mongoose');
const initdata = require('./data.js');

const listing = require('../models/listing.js');



mongoose.connect('mongodb://localhost:27017/wanderlust')
    .then(() => {
        console.log('Connected to MongoDB')
        return initDB();
    })
  
    .catch(err => {
        console.error('Error connecting to MongoDB or inserting data:', err);
    });



    const initDB= async ()=>{   
        await listing.deleteMany({});  
        initdata.data=initdata.data.map((obj)=>({...obj,image:obj.image.url}))
        await listing.insertMany(initdata.data);
        console.log('Data inserted successfully');
        
        // Format the data to match the schema's 'imageUrl' requirement
        
     
    }