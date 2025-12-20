const express = require('express')
const router  = express.Router()
const {managerAuthMiddleware} = require('../app/middlewares/managerAuthMiddleware')
const {authMiddleware} = require('../app/middlewares/authMiddleware')
const {getNlpData} = require('../app/controllers/RecommendController')
router.get('/parse', getNlpData)

module.exports = router