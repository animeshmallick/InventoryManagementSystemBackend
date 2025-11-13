const Token = require("../internal/token");
const Database = require("../config/DynamoDB");
const express = require("express");
const tables = require("../data/DynamoDBTables");

const router = express.Router();

router.post("/:productId", Token.verifyToken, async (req, res) => {
    const userId = req.userId;
    const userRole = req.userRole;
    const productId = req.params.productId;
    const updatedProductDetails = req.body;

    if(!userId)
        return res.status(401).json({success: false, message: 'User Authorization failed'});
    if(!productId )
        return res.status(400).json({success: false, message: 'ProductID missing or invalid'});
    const existingProduct = await Database.executeGetCommand(tables.PRODUCTS, {product_id: productId});

    if(!existingProduct)
        return res.json({success: false, message: 'Product Not Found'});

    existingProduct.productName = req.body.productName;
    existingProduct.productCategory = req.body.productCategory;
    existingProduct.productSellingPrice = Number(req.body.productSellingPrice);

    const response = await Database.executePutCommand(tables.PRODUCTS, existingProduct);
    if(response.httpStatusCode === 200)
        return res.status(200).json({message: "Product updated successfully", product: existingProduct});
})
module.exports = router;