const express = require('express');
const Router = express.Router();
const CustomerController = require('../controllers/CustomerController');
const authenticateToken = require('../middleware/authMiddleware');
Router.post('/customers', CustomerController.customer_Registration_create);
Router.post('/customerLogin', CustomerController.customer_login);
Router.post('/forgotPassword', CustomerController.requestPasswordReset);
Router.post('/resetPassword', CustomerController.resetPassword);
Router.get('/getCustomerByEmail', authenticateToken,CustomerController.getCustomerByEmail);

module.exports = Router;

