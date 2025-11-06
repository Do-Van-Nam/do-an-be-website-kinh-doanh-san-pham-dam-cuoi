const express = require('express')
const router = express.Router()
const {LoginController,loginWithGg} = require('../app/controllers/LoginController.js')

router.post('/withGg', loginWithGg)
router.post('/', LoginController)

module.exports = router