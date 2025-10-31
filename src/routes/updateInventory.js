const Database = require('../config/DynamoDB');
const express = require('express');
const Token = require('../internal/token');
const tables = require("../data/DynamoDBTables");

const router = express.Router();
router.post('/', Token.verifyToken, async function (req, res) {
    const userId = req.userId;
    const productDetails = req.body;
    if(!productDetails.productId || !productDetails.productQuantity || !productDetails.productPrice || !productDetails.requestType) {
        return res.status(400).json({message: 'Invalid Request'});
    }
    const allProducts = await Database.executeScanCommand(tables.PRODUCTS);
    const product = allProducts.find(product => product.product_id === productDetails.productId);
    if (!product)
        return res.status(400).json({message: 'Invalid product details'});

    let updatedStock = product.productStock;
    if(productDetails.requestType === "procure") {
        updatedStock += productDetails.productQuantity;
    }else if(productDetails.requestType === "sell") {
        if(product.productStock < productDetails.productQuantity) {
            return res.status(400).json({message: 'Insufficient product stock'});
        }
        updatedStock -= productDetails.productQuantity;
    }
    product.productPrice = productDetails.productPrice;
    product.productStock = updatedStock;
    product.lastUpdatedBy = userId;
    product.lastUpdatedAt = new Date().toISOString();
    const response = await Database.executePutCommand(tables.PRODUCTS, product);

    const updatedAllProducts = await Database.executeScanCommand(tables.PRODUCTS);
    const updatedProduct = updatedAllProducts.find(updatedProduct => updatedProduct.product_id === product.product_id);
    if(response.httpStatusCode === 200) {
        return res.status(200).json({message: `Successfully updated product: ${product.productName}`,
                                                allProducts:updatedAllProducts,
                                                product:updatedProduct});
    }
});
module.exports = router;