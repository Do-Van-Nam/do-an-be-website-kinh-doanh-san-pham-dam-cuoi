const express = require('express')
const router = express.Router()
const {updateFieldInAllItems,deleteVendorItemByType,getVendorItemByPlanGroupByType,createManyVendorItems,getVendorItemByType, getVendorItemsByAccId,getVendorItemById, updateVendorItem, deleteVendorItem, createVendorItem, updateManyVendorItems } = require('../app/controllers/VendorItemController')
const {managerAuthMiddleware} = require('../app/middlewares/managerAuthMiddleware')

router.get('/id/:id', getVendorItemById)
router.get('/type/:type', getVendorItemByType)
router.get('/getVendorItemGroupedByType/accId/:accId', getVendorItemByPlanGroupByType)
router.get('/accId/:accId',managerAuthMiddleware, getVendorItemsByAccId)
router.put('/id/:id',managerAuthMiddleware, updateVendorItem)
router.put('/updateAll', updateFieldInAllItems)
router.put('/updateMany', updateManyVendorItems)
router.delete('/:id',managerAuthMiddleware, deleteVendorItem)
router.delete('/type/:type', deleteVendorItemByType)
router.post('/', createVendorItem)
router.post('/addManyVendorItems', createManyVendorItems)

module.exports = router