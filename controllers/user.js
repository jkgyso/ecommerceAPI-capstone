const User = require('../models/User');
const Cart = require('../models/Cart');
const bcrypt = require('bcryptjs');
const auth = require('../auth');

module.exports.registerUser = async (req, res) => {
    try { 

      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).send({ error: 'Email already exists' });
      }
  
      if (!req.body.email.includes("@")) {
        return res.status(400).send({ error: 'Email invalid' });
      }
  
      if (req.body.mobileNo.length !== 11) {
        return res.status(400).send({ error: 'Mobile number invalid' });
      }
  
      if (req.body.password.length < 8) {
        return res.status(400).send({ error: 'Password must be at least 8 characters' });
      }

      let newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        mobileNo: req.body.mobileNo
      });
  
      await newUser.save();
      return res.status(201).send({ message: 'Registered Successfully' });
  
    } catch (err) {
      console.error('Error in user registration: ', err);
      return res.status(500).send({ error: 'Internal Server Error' });
    }
  };

module.exports.loginUser = (req, res) => {

	if(req.body.email.includes('@')) {
		
		return User.findOne({ email: req.body.email }).then(user => {

			if(user == null) {
				return res.status(404).send({ error: 'No Email Found'});

			} else {

				const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);

				if(isPasswordCorrect) {
					return res.status(200).send({ access: auth.createAccessToken(user)})			
				} else {				
					return res.status(401).send({ error: 'Email and password do not match'});
				}
			}
		}).catch(findErr => {

			console.error('Error in finding the user: ', findErr);
			return res.status(500).send({ error: 'Error in find' });

		})
	
	} else {

		return res.status(400).send({ error: 'Invalid email'});
	}
};

module.exports.userDetails = (req, res) => {

	return User.findById(req.user.id).then(user => {

		if(!user) {
			return res.status(404).send('User not found');
		}
		user.password = "";
		return res.status(200).send({ user });

	}).catch(findErr => {

		console.error('Error in finding the user: ', findErr);	

		return res.status(500).send({error: 'Failed to fetch user profile'});
	})
};

module.exports.setAdmin = (req, res) => {
    const updateIsAdmin = { isAdmin: true };

    User.findByIdAndUpdate(req.params.id, updateIsAdmin, { new: true })
        .then(user => {
            if (user) {
                res.status(200).send({
                    message: 'Set as admin successfully',
                    user
                });
            } else {
                res.status(404).send({ error: 'User not found' });
            }
        })
        .catch(updateErr => {
            console.error('Failed to set as admin', updateErr);
            res.status(500).send({ error: 'Failed to set as admin' });
        });
};

module.exports.resetPassword = async (req, res) => {
	console.log('reqUser', req.user);
  try {
    const { newPassword } = req.body;
    const { id } = req.user; 


    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(id, { password: hashedPassword });

    res.status(200).send({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
};

/*
module.exports.getCart = (req, res) => {

    if (req.user.isAdmin) {
        return res.status(403).send({ message: 'Admin is forbidden' });
    }

    const userId = req.user.id;

    return Cart.findOne({ userId }).then(cart => {

        if (!cart) {
            return res.status(404).send({ message: 'No cart found for this user' });
        }

        return res.status(200).send({ cartItems: cart.cartItems, totalPrice: cart.totalPrice });

    }).catch(findErr => {

        console.error('Error in finding the cart items: ', findErr);

        return res.status(500).send({ message: 'Failed to fetch cart items', findErr });
    });
};

module.exports.addToCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity, subtotal } = req.body;

  try {

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, cartItems: [], totalPrice: 0 });
    }

    const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);

    if (itemIndex !== -1) {

      cart.cartItems[itemIndex].quantity += quantity;
      cart.cartItems[itemIndex].subtotal += subtotal;
    } else {

      cart.cartItems.push({ productId, quantity, subtotal });
    }

    cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);

    await cart.save();


    res.status(200).send({ message: 'Item added to cart', cart });
  } catch (error) {

    res.status(500).send({ message: 'Error adding item to cart', error });
  }
};


module.exports.updateCartQuantity = async (req, res) => {
    try {
        if (req.user.isAdmin) {
            return res.status(403).send({ message: 'Admin is forbidden' });
        }

        const userId = req.user.id;
        const { productId, quantity, subtotal } = req.body;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' });
        }

        const existingItem = cart.cartItems.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity = quantity;
            existingItem.subtotal = subtotal;
        } else {
            cart.cartItems.push({ productId, quantity, subtotal });
        }

        cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

        const savedCart = await cart.save();

        return res.status(200).send({ message: 'Cart updated successfully', cart: savedCart });
    } catch (error) {
        console.error('Error updating cart:', error);
        return res.status(500).send({ message: 'Error updating cart', error });
    }
};


module.exports.removeFromCart = async (req, res) => {
    try {

        if (req.user.isAdmin) {
            return res.status(403).send({ message: 'Admin is forbidden' });
        }

        const userId = req.user.id;
        const productId = req.params.productId;

        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' });
        }

        const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);

        if (itemIndex > -1) {
            cart.cartItems.splice(itemIndex, 1);

            cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

            const savedCart = await cart.save();

            return res.status(200).send({ message: 'Item removed from cart successfully', cart: savedCart });
        } else {
            return res.status(404).send({ message: 'Item not found in cart' });
        }

    } catch (findErr) {
        console.error('Error removing product from cart:', findErr);
        return res.status(500).send({ message: 'Error removing product from cart', findErr });
    }
};


module.exports.clearCart = async (req, res) => {
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
            return res.status(400).send({ message: 'Cart is already empty' });
        }

        cart.cartItems = [];
        cart.totalPrice = 0;

        const savedCart = await cart.save();

        return res.status(200).send({ message: 'Cart cleared successfully', cart: savedCart });
    } catch (findErr) {
        console.error('Error clearing cart:', findErr);
        return res.status(500).send({ message: 'Error clearing cart', findErr });
    }
};
*/
