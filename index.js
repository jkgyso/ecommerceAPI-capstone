const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// insert routes require here!
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');

const app = express();

const port = 4001;

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cors());

mongoose.connect('mongodb+srv://admin:admin1234@cluster0.otywiso.mongodb.net/Ecommerce-API?retryWrites=true&w=majority&appName=Cluster0');

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => console.log(`We're connected to the MongoDb Atlas`));

// insert app.user routes here!
app.use('/b1/users', userRoutes);
app.use('/b1/products', productRoutes);
app.use('/b1/cart', cartRoutes);
app.use('/b1/orders', orderRoutes);

if(require.main === module) {

	app.listen(process.env.PORT || port, () => console.log(`API is now online on port ${process.env.PORT || port}`))
}

module.exports = {app, mongoose};