const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    id: Number,
    customer_id: Number,
    first_name: String,
    last_name: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    province: String,
    country: String,
    zip: String,
    phone: String,
    name: String,
    province_code: String,
    country_code: String,
    country_name: String,
    default: Boolean
});
const MarketingConsentSchema = new mongoose.Schema({
    state: String,
    opt_in_level: String,
    consent_updated_at: Date,
    consent_collected_from: String
});
const CustomerRegistrationSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    email: String,
    created_at: Date,
    updated_at: Date,
    first_name: String,
    last_name: String,
    orders_count: Number,
    state: String,
    total_spent: String,
    last_order_id: Number,
    note: String,
    verified_email: Boolean,
    multipass_identifier: String,
    tax_exempt: Boolean,
    tags: String,
    last_order_name: String,
    currency: String,
    phone: String,
    addresses: [AddressSchema],
    tax_exemptions: [String],
    email_marketing_consent: MarketingConsentSchema,
    sms_marketing_consent: MarketingConsentSchema,
    admin_graphql_api_id: String,
    default_address: AddressSchema,
    password:  String,
    resetPasswordCode: String,
    resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model("Customerinfo", CustomerRegistrationSchema);
