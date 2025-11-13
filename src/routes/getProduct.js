const Token = require('../internal/token');
const Database = require('../config/DynamoDB');
const tables = require('../data/DynamoDBTables');
const express = require('express');

const router = express.Router();
router.post("/:productId", Token.verifyToken, async (req, res) => {
    const userId = req.userId;
    const userRole = req.userRole;
    const productId = req.params.productId;

    if(!userId)
        return res.status(401).json({success: false, message: 'User Authorization failed'});
    if(!productId )
        return res.status(400).json({success: false, message: "Product ID missing or invalid"});
    const productDetails = await Database.executeGetCommand(tables.PRODUCTS, {product_id:productId});

    if(!productDetails)
        return res.status(404).json({success: false, message: 'Product not found'});
    return res.status(200).json({success: true, product: productDetails});
})
module.exports = router;