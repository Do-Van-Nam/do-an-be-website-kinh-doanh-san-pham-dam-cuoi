const express = require('express')
const router  = express.Router()
const {managerAuthMiddleware} = require('../app/middlewares/managerAuthMiddleware')
const {authMiddleware} = require('../app/middlewares/authMiddleware')
const { 
    getOrderByAccId, 
    addToOrder, 
    addManyToOrder,
    getOrdersBySellerId,
    updateOrderStatus,getAllOrder
} = require('../app/controllers/OrderController');

router.get('/seller/:sellerId', getOrdersBySellerId);
router.get('/all', getAllOrder);
router.get('/:accId', getOrderByAccId);
router.post('/add', addToOrder);
router.post('/add-many', addManyToOrder);
router.put('/:orderId/status', updateOrderStatus);

module.exports = router