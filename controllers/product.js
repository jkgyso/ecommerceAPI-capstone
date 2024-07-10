const Product = require('../models/Product');
const bcrypt = require('bcryptjs');
const auth = require('../auth');


module.exports.createProduct = (req, res) => {
 
		return Product.findOne({ name: req.body.name }).then(existingProduct => {

			let newProduct = new Product({
				name : req.body.name,
				description : req.body.description,
				price : req.body.price
			});

			if(existingProduct) {				
				return res.status(409).send({ error : 'Product already exists' });
			}

			return newProduct.save().then(product => res.status(201).send({ product })).catch(saveError => {
				console.error('Error in saving the product: ', saveError);
				res.status(500).send({ error : 'Failed to save the product' });
			});

		}).catch(findErr => {
			console.error('Error in finding the product: ', findErr);
			return res.status(500).send({ message: "Error in finding the product" });
		});
};

module.exports.getAllProducts = (req, res) => {

	return Product.find({}).then(products => {

		// added validations to check if there are courses saved in the database 
		if(products.length > 0) {

			return res.status(200).send( {products} )
		
		} else {

			return res.status(404).send({ message: 'No products found.' })
		}

	}).catch(findErr => {

		console.error('Error in finding all products: ', findErr);
		return res.status(500).send({ error: 'Error finding products'})

	});
};


module.exports.getAllActive = (req, res) => {

	return Product.find({ isActive : true }).then(products => {

        if (products.length > 0){          
            return res.status(200).send({ products });
        } else {           
            return res.status(404).send({ message : "No active product found." });
        }
        
    }).catch(findErr => {
    	console.error('Error finding active products: ', findErr);
    	return res.status(500).send({ error : 'Error finding active products'});
    });
};

module.exports.getProduct = (req, res) => {

	return Product.findById(req.params.productId).then(product => {

		if(!product) {
			return res.status(404).send({ error: 'Product not found '});
		}

		return res.status(200).send({ product });

	}).catch(findErr => {
		console.error('Error finding product: ', findErr);
    	return res.status(500).send({ error : 'Failed to fetch product'});
    });
};


module.exports.updateProduct = (req, res) => {
    let productId = req.params.productId;

    let updatedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    };

    Product.findByIdAndUpdate(productId, updatedProduct, { new: true })
        .then(updatedProduct => {
            if (updatedProduct) {
                return res.status(200).send({
                    message: "Product updated successfully",
                    updatedProduct: updatedProduct
                });
            } else {
                return res.status(404).send({ error: 'Product not found' });
            }
        })
        .catch(updateErr => {
            console.error('Error in updating the product: ', updateErr);
            return res.status(500).send({ error: 'Error in updating the product' });
        });
};


module.exports.archiveProduct = (req, res) => {

    let archiveProduct = {
        isActive: false
    };

    return Product.findByIdAndUpdate(req.params.productId, archiveProduct, { new: true }).then(updatedProduct => {

        if(updatedProduct) {

            return res.status(200).send({
                message: 'Product archived successfully',
                updatedProduct
            });

        } else {

            return res.status(404).send({ error: 'Product not found' });
        }
    }).catch(updateErr => {

        console.error('Failed to archive product', updateErr);
        return res.status(500).send({ error: 'Failed to archive product' });
    });
};

module.exports.activateProduct = (req, res) => {

    let updateActiveField = {
        isActive: true
    }
    
    return Product.findByIdAndUpdate(req.params.productId, updateActiveField, { new: true }).then(activateProduct => {

        if (activateProduct) {

           return res.status(200).send({
                message: 'Product activated successfully',
                activateProduct
            });

        } else {

            return res.status(404).send({ error : 'Product not found' });
        }
    }).catch(updateErr => {

        console.error('Failed to activate product', updateErr);
        return res.status(500).send({ error: 'Failed to activate a product' });
    });
};

module.exports.searchProductByName = async (req, res) => {
	try {

	  const { productName } = req.body;
  
	  const product = await Product.find({
		name: { $regex: productName, $options: 'i' }
	  });
  
	  res.send(product);
	} catch (error) {
	  console.error(error);
	  res.status(500).send({ error: 'Internal Server Error' });
	}
};

module.exports.searchProducts = async (req, res) => {
  const { minPrice, maxPrice } = req.body;

  if (minPrice == null || maxPrice == null) {
    return res.status(400).send({ message: 'minPrice and maxPrice are required' });
  }

  try {
    const products = await Product.find({
      price: { $gte: minPrice, $lte: maxPrice }
    });
    res.send(products);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};