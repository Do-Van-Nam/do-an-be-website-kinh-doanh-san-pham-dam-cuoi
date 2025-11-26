const mongoose  = require('mongoose')
const Schema = mongoose.Schema

const VendorItem = new Schema({
    accId : {type: String},
    name : { type : String, },
    type : { type : String, },
    description : { type : String, },
    rate : {type: Number,default:0.0},
    noReview : {type: Number,default:0.0},
    imgLink: {type:String},
    typeVendor : {type:String,default:"sell"},  // sell, rent , both
    priceSell: {type:Number,default:0},
    priceRent: {type:Number,default:0},
    // address: {type:String},
    // subInfo : { type : String, },
    // priceFrom : {type: Number},
    // priceTo : {type: Number}, 
})

module.exports = mongoose.model('VendorItem' , VendorItem)