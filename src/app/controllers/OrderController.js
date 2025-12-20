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
            endDate
        } = req.body

        if (!accId || !itemId) {
            return res.status(400).json({ message: 'Missing accId or itemId' })
        }

       // let order = await Order.findOne({ accId })

     //   if (!order) {
            const newItems = [{ itemId, quantity, price, status }]
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
            const newItems = items.map(({ itemId, quantity = 1, price = 0, status = 'pending' }) => ({
                itemId,
                quantity,
                price,
                status,
            }))
        let    order = new Order({
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

module.exports = {
    getOrderByAccId,
    addToOrder,
    addManyToOrder,
}