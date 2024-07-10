const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	name: {
        type: String,
        required: [true, 'name is required']
    },
    description: {
        type: String,
        required: [true, 'description is required']
    },
    price: {
		type: Number,
		required: [true, 'Total Price is required']
	},
	isActive: {
        type: Boolean,
        default: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', productSchema); 