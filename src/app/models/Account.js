const mongoose  = require('mongoose')
const Schema = mongoose.Schema

const Account = new Schema({
    phone : { type : String , },
    name : { type : String , },
    password : { type : String, }, 
    role : { type : String, },
    mail : { type : String, },

})

module.exports = mongoose.model('Account' , Account)