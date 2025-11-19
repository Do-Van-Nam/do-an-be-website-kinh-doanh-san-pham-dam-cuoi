const mongoose  = require('mongoose')
const Schema = mongoose.Schema

const Account = new Schema({
    phone : { type : String , },
    name : { type : String , },
    password : { type : String, }, 
    role : { type : String, },   // user, manager, seller
    mail : { type : String, },

    shopName : { type : String, },
    shopAddress : { type : String, },
})

module.exports = mongoose.model('Account' , Account)