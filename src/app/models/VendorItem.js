const mongoose  = require('mongoose')
const Schema = mongoose.Schema

const VendorItem = new Schema({
    accId : {type: String},
    name : { type : String, },
    type : { type : String, },
    description : { type : String, },
    rate : {type: Number,default:0},
    noReview : {type: Number,default:0},
    imgLink: {type:String},
    typeVendor : {type:String},  // sell, rent , both
    priceSell: {type:Number},
    priceRent: {type:Number},
  
    address: {type:String},
    subInfo : { type : String, },
    priceFrom : {type: Number},
    priceTo : {type: Number},
   
    
})

module.exports = mongoose.model('VendorItem' , VendorItem)