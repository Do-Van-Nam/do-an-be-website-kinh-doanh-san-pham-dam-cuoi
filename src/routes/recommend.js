const express = require('express')
const router  = express.Router()
const {managerAuthMiddleware} = require('../app/middlewares/managerAuthMiddleware')
const {authMiddleware} = require('../app/middlewares/authMiddleware')
const {getNlpData, getNlpData2} = require('../app/controllers/RecommendController')
router.post('/parse', getNlpData)
router.post('/parse2', getNlpData2)
module.exports = router