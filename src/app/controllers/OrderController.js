const Order = require('../models/Order')

// Helper function to calculate totalAmount from items
const calculateTotalAmount = (items) => {
    return items.reduce((total, item) => {
        return total + (item.quantity * item.price)
    }, 0)
}

// LẤY ORDER THEO accId
const getOrderByAccId = async (req, res) => {
    try {
        const { accId } = req.params

        const order = await Order.find({ accId })

        if (!order) {
            return res.status(200).json({ order: { accId, items: [] } })
        }

        return res.status(200).json({ order })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server error' })
    }
}
const getAllOrder = async (req, res) => {
    try {
        const order = await Order.find({})

        if (!order) {
            return res.status(200).json({ order: [] })
        }

        return res.status(200).json({ order })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server error' })
    }
}
// THÊM SẢN PHẨM VÀO ORDER (nếu chưa có thì tạo mới)
const addToOrder = async (req, res) => {
    try {
        const { 
            accId, 
            itemId, 
            quantity = 1, 
            price = 0, 
            status = 'pending',
            paymentStatus,
            typeOrder,
            startDate,
            endDate,
            sellerId
        } = req.body

        if (!accId || !itemId) {
            return res.status(400).json({ message: 'Missing accId or itemId' })
        }

       // let order = await Order.findOne({ accId })

     //   if (!order) {
            const newItems = [{ itemId, quantity, price, status ,sellerId}]
           let order = new Order({
                accId,
                items: newItems,
                paymentStatus: paymentStatus || 'cash',
                totalAmount: calculateTotalAmount(newItems),
                typeOrder: typeOrder || 'buy',
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : new Date(),
            })
            await order.save()
            return res.status(201).json({ message: 'Order created and item added', order })
     //   }

        // const existingItem = order.items.find(item => item.itemId === itemId)

        // if (existingItem) {
        //     existingItem.quantity += quantity
        //     existingItem.price = price || existingItem.price
        //     // Only update status if provided
        //     if (status && status !== 'pending') {
        //         existingItem.status = status
        //     }
        // } else {
        //     order.items.push({ itemId, quantity, price, status })
        // }

        // // Update totalAmount
        // order.totalAmount = calculateTotalAmount(order.items)
        
        // // Update optional fields if provided
        // if (paymentStatus) order.paymentStatus = paymentStatus
        // if (typeOrder) order.typeOrder = typeOrder
        // if (startDate) order.startDate = new Date(startDate)
        // if (endDate) order.endDate = new Date(endDate)

        // await order.save()
        // return res.status(200).json({ message: 'Item added to order', order })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server error' })
    }
}

// THÊM NHIỀU SẢN PHẨM VÀO ORDER (nhận mảng items trong body)
const addManyToOrder = async (req, res) => {
    try {
        const { 
            accId, 
            items = [],
            paymentStatus,
            typeOrder,
            startDate,
            endDate
        } = req.body

        if (!accId || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Missing accId or items' })
        }

        // let order = await Order.findOne({ accId })

        // if (!order) {
            const newItems = items.map(({ itemId, quantity = 1, price = 0, status = 'pending',sellerId }) => ({
                itemId,
                quantity,
                price,
                status,
                sellerId
            }))
        let order = new Order({
                accId,
                items: newItems,
                paymentStatus: paymentStatus || 'cash',
                totalAmount: calculateTotalAmount(newItems),
                typeOrder: typeOrder || 'buy',
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : new Date(),
            })
            await order.save()
            return res.status(201).json({ message: 'Order created and items added', order })
        // }

        // Gộp theo itemId
        // items.forEach(({ itemId, quantity = 1, price = 0, status = 'pending' }) => {
        //     if (!itemId) return
        //     const existingItem = order.items.find(item => item.itemId === itemId)
        //     if (existingItem) {
        //         existingItem.quantity += quantity
        //         existingItem.price = price || existingItem.price
        //         // Only update status if provided and not default
        //         if (status && status !== 'pending') {
        //             existingItem.status = status
        //         }
        //     } else {
        //         order.items.push({ itemId, quantity, price, status })
        //     }
        // })

        // // Update totalAmount
        // order.totalAmount = calculateTotalAmount(order.items)
        
        // // Update optional fields if provided
        // if (paymentStatus) order.paymentStatus = paymentStatus
        // if (typeOrder) order.typeOrder = typeOrder
        // if (startDate) order.startDate = new Date(startDate)
        // if (endDate) order.endDate = new Date(endDate)

        // await order.save()
        // return res.status(200).json({ message: 'Items added to order', order })
   
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server error' })
    }
}

// LẤY DANH SÁCH ORDER THEO sellerId
const getOrdersBySellerId = async (req, res) => {
    try {
        const { sellerId } = req.params

        if (!sellerId) {
            return res.status(400).json({ message: 'Missing sellerId' })
        }

        // Tìm các order có ít nhất một item có sellerId trùng khớp
        const orders = await Order.find({
            'items.sellerId': sellerId
        }).sort({ orderDate: -1 }) // Sắp xếp theo ngày đặt hàng mới nhất

        // Lọc và chỉ trả về các items có sellerId trùng khớp trong mỗi order
        const filteredOrders = orders.map(order => {
            const filteredItems = order.items.filter(item => item.sellerId === sellerId)
            return {
                ...order.toObject(),
                items: filteredItems,
                // Tính lại totalAmount chỉ cho các items của seller này
                totalAmount: filteredItems.reduce((total, item) => {
                    return total + (item.quantity * item.price)
                }, 0)
            }
        })

        return res.status(200).json({ 
            message: 'Orders retrieved successfully',
            orders: filteredOrders,
            count: filteredOrders.length
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server error' })
    }
}

// CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG THEO orderId
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params
        const { status, itemId } = req.body

        if (!orderId) {
            return res.status(400).json({ message: 'Missing orderId' })
        }

        if (!status) {
            return res.status(400).json({ message: 'Missing status' })
        }

        // Validate status values
        const validStatuses = ['pending', 'completed', 'cancelled', 'shipping']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status. Must be one of: pending, completed, cancelled, shipping' 
            })
        }

        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(404).json({ message: 'Order not found' })
        }

        // Nếu có itemId, chỉ cập nhật status của item đó
        if (itemId) {
            const item = order.items.find(item => item.itemId === itemId)
            if (!item) {
                return res.status(404).json({ message: 'Item not found in order' })
            }
            item.status = status
        } else {
            // Nếu không có itemId, cập nhật status cho tất cả items
            order.items.forEach(item => {
                item.status = status
            })
        }

        await order.save()
        return res.status(200).json({ 
            message: 'Order status updated successfully', 
            order 
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server error' })
    }
}

module.exports = {
    getOrderByAccId,
    addToOrder,
    addManyToOrder,
    getOrdersBySellerId,
    updateOrderStatus,
    getAllOrder
}