const mongoose  = require('mongoose')
const Schema = mongoose.Schema

const Order = new Schema({
    accId : {type: String},
    items : [
        {
            itemId: {type: String},
            sellerId: {type: String},
            quantity: {type: Number, default: 1},
            status: {type: String, default: 'pending'}, // pending, completed, cancelled, shipping  
            price: {type: Number, default: 0},
        }
    ],  
    paymentStatus: {type: String, default: 'cash'},// cash, bank 
    totalAmount: {type: Number, default: 0},
    orderDate: {type: Date, default: Date.now},
    startDate: {type: Date, default: Date.now},
    endDate: {type: Date, default: Date.now},
    typeOrder: {type: String, default: "buy"},  // buy , rent
})

module.exports = mongoose.model('Order' , Order)