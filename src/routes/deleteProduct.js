const Token = require('../internal/token');
const tables = require('../data/DynamoDBTables');
const Database = require('../config/DynamoDB');
const express = require('express');
const router = express.Router();
router.post('/', Token.verifyToken, async function(req,res,next) {
    const userId = req.userId;
    const userRole = req.userRole;
    const productDetails = req.body;
    if(!userId || userRole !== "admin")
        return res.status(401).json({message:'User Authorization failed'});
    if(!productDetails.product_id)
        return res.status(400).json({message:'Bad Request'});
    const allProducts = await Database.executeScanCommand(tables.PRODUCTS);
    const validProduct = allProducts.find(product => product.product_id === productDetails.product_id);
    if(!validProduct)
        return res.status(401).json({message:'Product Not Found'});
    const response = await Database.executeDeleteCommand(tables.PRODUCTS, {product_id:productDetails.product_id});
    const updatedAllProducts = await Database.executeScanCommand(tables.PRODUCTS);
    if(response.httpStatusCode === 200)
        return res.status(200).json({message: "Product deleted successfully",updatedAllProducts});
});
module.exports = router;