const express = require('express')
const router = express.Router()

router.post('/', (req,res)=>{
    res.clearCookie('token',{
        sameSite: 'none',
        secure: true
    }
    )
    res.json({message: 'Logged out successfully'})
})

module.exports = router