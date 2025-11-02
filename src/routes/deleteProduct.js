const Token = require('../internal/token');
const tables = require('../data/DynamoDBTables');
const Database = require('../config/DynamoDB');
const express = require('express');
const router = express.Router();
router.post('/:productId', Token.verifyToken, async function(req,res,next) {
    const userId = req.userId;
    const userRole = req.userRole;
    const productId = req.params.productId;
    if(!userId || userRole !== "admin")
        return res.status(401).json({message:'User Authorization failed'});
    if(!productId)
        return res.status(400).json({message:'Bad Request'});
    const allProducts = await Database.executeScanCommand(tables.PRODUCTS);
    const validProduct = allProducts.find(product => product.product_id === productId);
    if(!validProduct)
        return res.status(401).json({message:'Product Not Found'});
    const response = await Database.executeDeleteCommand(tables.PRODUCTS, {product_id:productId});
    const updatedAllProducts = await Database.executeScanCommand(tables.PRODUCTS);
    if(response.httpStatusCode === 200)
        return res.status(200).json({message: "Product deleted successfully",product: updatedAllProducts});
});
module.exports = router;