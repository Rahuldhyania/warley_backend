const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    productId: String,
    title: String,
    images: [
        {
            src: String,
            url: String
        }
    ],
    options: [
        {
            id: String,
            name: String,
            values: [String]
        }
    ],
    tags: [String],
    variants: [
        {
            id: String,
            image: String,
            inventoryQuantity: Number,
            price: String,
            title: String
        }
    ]
});

const WishlistSchema = new mongoose.Schema({
    customerId: { type: Number, required: true, unique: true },
    products: [ProductSchema] // Array of products in the wishlist
}, { timestamps: true });

module.exports = mongoose.model("Wishlist", WishlistSchema);
