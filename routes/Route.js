const express = require('express');
const Router = express.Router();
const CustomerController = require('../controllers/CustomerController');
const WishListController = require('../controllers/WishListController')
const authenticateToken = require('../middleware/authMiddleware');
Router.post('/customers', CustomerController.customer_Registration_create);
Router.post('/customerLogin', CustomerController.customer_login);
Router.post('/forgotPassword', CustomerController.requestPasswordReset);
Router.post('/resetPassword', CustomerController.resetPassword);
Router.get('/getCustomerByEmail', authenticateToken,CustomerController.getCustomerByEmail);
Router.delete('/deleteCustomer/:customerId',  authenticateToken, CustomerController.delCustomerById);
Router.post('/addToWishlist', authenticateToken, WishListController.addProductToWishlist);
Router.get('/wishlist/:customerId', authenticateToken, WishListController.getWishlistByCustomerId);
Router.delete('/wishlist/:customerId/product/:productId', authenticateToken, WishListController.deleteProductFromWishlist);
Router.delete('/wishlist/:customerId/product/:productId/variant/:variantId', authenticateToken, WishListController.deleteVariantFromWishlist);
Router.delete('/wishlist/:customerId', authenticateToken, WishListController.deleteAllProductsFromWishlist);


module.exports = Router;

