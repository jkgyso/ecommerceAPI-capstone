const Order = require('../models/Order');
const Cart = require('../models/Cart');
const bcrypt = require('bcryptjs');
const auth = require('../auth');


module.exports.createOrder = async (req, res) => { 
    try {
        if (req.user.isAdmin) {
            return res.status(403).send({ message: 'Admin is forbidden' });
        }

        const userId = req.user.id;
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' });
        }

        if (cart.cartItems.length === 0) {
            return res.status(400).send({ message: 'No items to Checkout' });
        } else {
            const newOrder = new Order({
                userId,
                productsOrdered: cart.cartItems,
                totalPrice: cart.totalPrice
            });

            const savedOrder = await newOrder.save();

            await Cart.deleteOne({ userId });

            return res.status(201).send({ message: 'Order placed successfully' });
        }

    } catch (findErr) {
        console.error('Error processing order:', findErr);
        return res.status(500).send({ message: 'Error processing order', findErr });
    }
}

module.exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId });

        if (!orders.length) {
            return res.status(404).send({ message: 'No orders found for this user' });
        }

        res.status(200).send({orders});
    } catch (error) {
        res.status(500).send({ message: 'Failed to retrieve orders', error: error.message });
    }
};

module.exports.getAllOrders = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).send({ message: 'Only admins are allowed to access this endpoint' });
        }

        const orders = await Order.find();

        return res.status(200).send({ orders });
    } catch (err) {
        console.error('Error retrieving orders:', err);
        return res.status(500).send({ message: 'Error retrieving orders', error: err.message });
    }
};
