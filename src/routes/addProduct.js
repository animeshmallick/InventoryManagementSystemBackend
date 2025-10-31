const Token = require('../internal/token');
const Database = require('../config/DynamoDB');
const tables = require('../data/DynamoDBTables');
const express = require('express');
const Util = require('../utils/utils');

const router = express.Router();

router.post('/', Token.verifyToken, async function (req, res) {
    const productDetails = req.body;
    const userId = req.userId;
    const userRole = req.userRole;
    if(!userId || userRole !== "admin")
        return res.status(401).send('User Authorization failed');
    if (!productDetails || !productDetails.productName || !productDetails.productQuantity || !productDetails.productPrice)
        return res.status(400).json({message: 'Invalid product details'});
    const timestamp = new Date().toISOString();
    const productId = Util.generateProductId();
    const product = {
        product_id : productId,
        productName: productDetails.productName,
        productStock: productDetails.productQuantity,
        productPrice: productDetails.productPrice,
        createdBy: userId,
        lastUpdatedAt: timestamp
    };
    const response = await Database.executePutCommand(tables.PRODUCTS, product);
    const updatedAllProducts = await Database.executeScanCommand(tables.PRODUCTS);
    if(response.httpStatusCode === 200){
        return res.status(200).json({message: 'Product successfully added',
                                                allProducts: updatedAllProducts,
                                                product: product});
    }
});
module.exports = router;