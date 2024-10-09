const bcrypt = require('bcryptjs');
const axios = require('axios');
const Customerinfo = require('../model/CustomerModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const customer_Registration_create = async (req, res) => {
    const { first_name, last_name, email, phone, addresses, password, password_confirmation } = req.body;
    if (password !== password_confirmation) {
        return res.status(400).json({ message: "Passwords do not match" });
    }
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const headers = {
        "X-Shopify-Access-Token": `${process.env.ACCESS_TOKEN}`,
        "Content-Type": "application/json"
    };
    const body = JSON.stringify({
        "customer": {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": phone,
            "addresses": [{
                "address1": addresses[0].address1,
                "city": addresses[0].city,
                "province": addresses[0].province,
                "zip": addresses[0].zip,
                "country": addresses[0].country,
                "phone": addresses[0].phone
            }],
            "password": password,
            "password_confirmation": password_confirmation
        }
    });
    const requestOptions = {
        method: "POST",
        headers: headers,
        body: body,
        redirect: "follow"
    };

    try {
        const response = await fetch(`https://${process.env.SHOPIFY_APP_URL}/admin/api/2024-01/customers.json`, requestOptions);
        const result = await response.json(); // Assuming the API returns JSON

        if (response.ok) {
            const customerData = result.customer;

            // Save the customer to MongoDB
            const savedCustomer = await Customerinfo.create({id: customerData.id,
                email: customerData.email,
                created_at: new Date(customerData.created_at),
                updated_at: new Date(customerData.updated_at),
                first_name: customerData.first_name,
                last_name: customerData.last_name,
                orders_count: customerData.orders_count,
                state: customerData.state,
                total_spent: customerData.total_spent,
                last_order_id: customerData.last_order_id,
                note: customerData.note,
                verified_email: customerData.verified_email,
                multipass_identifier: customerData.multipass_identifier,
                tax_exempt: customerData.tax_exempt,
                tags: customerData.tags,
                last_order_name: customerData.last_order_name,
                currency: customerData.currency,
                phone: customerData.phone,
                addresses: customerData.addresses,
                tax_exemptions: customerData.tax_exemptions,
                email_marketing_consent: customerData.email_marketing_consent,
                sms_marketing_consent: customerData.sms_marketing_consent,
                admin_graphql_api_id: customerData.admin_graphql_api_id,
                default_address: customerData.default_address,
                password: hashedPassword
            });

            res.status(201).json(savedCustomer);


        } else {
            // Handle errors from Shopify response
            if (result.errors && result.errors.email && result.errors.email.includes('has already been taken')) {
                return res.status(409).json({ message: "The email address is already in use. Please use a different email address." });
            }
            if (result.errors && result.errors.phone && result.errors.phone[0].includes('has already been taken')) {
                return res.status(409).json({ message: "The phone number is already in use. Please use a different phone number." });
            }
            throw new Error("Unknown error occurred"); // Throw if error type is not recognized
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Failed to create customer", error: error.toString() });
    }
};

const customer_login = async(req,res)=>{
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Check if the user exists
        const user = await Customerinfo.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Compare password with hashed password in database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        // Create and assign a token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.SECRETKEY,  // Replace 'your_jwt_secret' with your actual secret key
            { expiresIn: '1h' }  // Token expires in one hour
        );

        res.json({
            message: 'Logged in successfully!',
            token: token,
            user: {
                id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const generateNumericCode = (length) => {
    const characters = '0123456789';
    let result = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(bytes[i] / 256 * characters.length)];
    }
    return result;
  };

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    try {
        const user = await Customerinfo.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Generate a temporary password reset code
        const resetCode = generateNumericCode(6);
        // Save the reset code and its expiration date in the database
        user.resetPasswordCode = resetCode;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send the email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'vikasbase2brand@gmail.com',
                pass: 'pjphbswhlyhkdpjv'
            }
        });


        const mailOptions = {
            from: 'vikasbase2brand@gmail.com',
            to: user.email,
            subject: 'Password Reset',
            text: ` you one time password is ${resetCode}
            You requested a password reset. Please use the following code to reset your password: ${resetCode}.
            This code will expire in 1 hour.`
        };

        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ message: 'Error sending email.' });
            }
            res.status(200).json({ message: 'Password reset email sent successfully.' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


const resetPassword = async (req, res) => {
    const { email, resetCode, newPassword, newPasswordConfirmation } = req.body;

    if (!email || !resetCode || !newPassword || !newPasswordConfirmation) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (newPassword !== newPasswordConfirmation) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    try {
        const user = await Customerinfo.findOne({ email: email });
        if (!user || user.resetPasswordCode !== resetCode || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired reset code.' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCustomerByEmail = async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const customer = await Customerinfo.findOne({ email: email });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        res.status(200).json(customer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
     customer_Registration_create,
     customer_login,
     requestPasswordReset,
     resetPassword,
     getCustomerByEmail
    };
