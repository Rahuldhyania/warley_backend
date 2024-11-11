const Wishlist = require("../model/WishListModel");

const addProductToWishlist = async (req, res) => {
  try {
    const { customerId, productData } = req.body;

    // Find the wishlist by customer ID or create a new one if it doesn't exist
    let wishlist = await Wishlist.findOne({ customerId });
    if (!wishlist) {
      wishlist = new Wishlist({ customerId, products: [] });
    }

    // Check if the product is already in the wishlist
    const productExists = wishlist.products.some(
      (product) => product.productId === productData.productId
    );
    if (productExists) {
      return res.status(400).json({
        success: false,
        message: "Product already exists in the wishlist.",
      });
    }

    // Add the product to the wishlist
    wishlist.products.push(productData);
    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully.",
      wishlist: wishlist.products,
    });
  } catch (error) {
    console.error("Error adding product to wishlist:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding the product to the wishlist.",
      error: error.message,
    });
  }
};

const getWishlistByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params; // Get the customer ID from the route parameters

    // Find the wishlist by customer ID
    const wishlist = await Wishlist.findOne({ customerId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found for the given customer ID.",
      });
    }

    return res.status(200).json({
      success: true,
      customerId: customerId,
      wishlist: wishlist.products,
    });
  } catch (error) {
    console.error("Error retrieving wishlist:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the wishlist.",
      error: error.message,
    });
  }
};

const deleteProductFromWishlist = async (req, res) => {
  try {
    const { customerId, productId } = req.params;

    // Format productId to match the format in the database
    const formattedProductId = `gid://shopify/Product/${productId}`;

    // Find the wishlist by customer ID
    const wishlist = await Wishlist.findOne({ customerId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found for the given customer ID.",
      });
    }

    // Check if the product exists in the wishlist
    const productExists = wishlist.products.some(
      (product) => product.productId === formattedProductId
    );
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product not found in the wishlist for the given product ID.",
      });
    }

    // Filter out the product by productId
    wishlist.products = wishlist.products.filter(
      (product) => product.productId !== formattedProductId
    );
    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Product deleted from wishlist successfully.",
      wishlist: wishlist.products,
    });
  } catch (error) {
    console.error("Error deleting product from wishlist:", error.message);
    return res.status(500).json({
      success: false,
      message:
        "An error occurred while deleting the product from the wishlist.",
      error: error.message,
    });
  }
};

const deleteVariantFromWishlist = async (req, res) => {
  try {
    const { customerId, productId, variantId } = req.params;

    // Format productId and variantId to match the format in the database
    const formattedProductId = `gid://shopify/Product/${productId}`;
    const formattedVariantId = `gid://shopify/ProductVariant/${variantId}`;

    // Find the wishlist by customer ID
    const wishlist = await Wishlist.findOne({ customerId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found for the given customer ID.",
      });
    }

    // Find the product in the wishlist
    const product = wishlist.products.find(
      (product) => product.productId === formattedProductId
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found in the wishlist for the given product ID.",
      });
    }

    // Check if the variant exists in the product
    const variantIndex = product.variants.findIndex(
      (variant) => variant.id === formattedVariantId
    );
    if (variantIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Variant not found in the product for the given variant ID.",
      });
    }

    // Remove the variant from the product
    product.variants.splice(variantIndex, 1);

    // Only remove the product if there are no variants left
    if (product.variants.length === 0) {
      wishlist.products = wishlist.products.filter(
        (prod) => prod.productId !== formattedProductId
      );
    } else {
      // Update the product in the products array
      wishlist.products = wishlist.products.map((prod) =>
        prod.productId === formattedProductId ? product : prod
      );
    }

    // Save the updated wishlist
    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Variant deleted from wishlist successfully.",
      wishlist: wishlist.products,
    });
  } catch (error) {
    console.error("Error deleting variant from wishlist:", error.message);
    return res.status(500).json({
      success: false,
      message:
        "An error occurred while deleting the variant from the wishlist.",
      error: error.message,
    });
  }
};

const deleteAllProductsFromWishlist = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Find and delete the entire wishlist document by customer ID
    const deletedWishlist = await Wishlist.findOneAndDelete({ customerId });
    if (!deletedWishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found for the given customer ID.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer's wishlist deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting customer's wishlist:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the customer's wishlist.",
      error: error.message,
    });
  }
};





module.exports = {
  addProductToWishlist,
  getWishlistByCustomerId,
  deleteProductFromWishlist,
  deleteVariantFromWishlist,
  deleteAllProductsFromWishlist,
};
