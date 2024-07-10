const express = require('express');
const userController = require('../controllers/user');
const {verify, verifyAdmin} = require('../auth');

const router = express.Router();

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/details", verify, userController.userDetails);

router.patch("/:id/set-as-admin", verify, verifyAdmin, userController.setAdmin);

router.patch('/update-password', verify, userController.resetPassword);
/*
router.get('/get-cart', verify, userController.getCart);

router.post('/add-to-cart', verify, userController.addToCart);

router.patch('/update-cart-quantity', verify, userController.updateCartQuantity);

router.patch('/:productId/remove-from-cart', verify, userController.removeFromCart);

router.put('/clear-cart', verify, userController.clearCart);
*/

module.exports = router;