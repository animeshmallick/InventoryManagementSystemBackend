const Database = require('../config/DynamoDB');
const express = require('express');
const Token = require('../internal/token');
const tables = require("../data/DynamoDBTables");
const Util = require("../utils/utils");

const router = express.Router();
router.post('/', Token.verifyToken, async function (req, res) {
    const userId = req.userId;
    const productDetails = req.body;
    if(!productDetails.productId || !productDetails.productQuantity || !productDetails.unitPrice || !productDetails.requestType) {
        return res.status(400).json({message: 'Invalid Request'});
    }
    const allProducts = await Database.executeScanCommand(tables.PRODUCTS);
    const product = allProducts.find(product => product.product_id === productDetails.productId);
    if (!product)
        return res.status(400).json({message: 'Invalid product details'});

    const amount = productDetails.productQuantity * productDetails.unitPrice;
    if(productDetails.requestType === "procure") {
        product.productStock += Number(productDetails.productQuantity);
        product.totalAmountProcured = Number(product.totalAmountProcured || 0) + Number(amount);
    }else if(productDetails.requestType === "sell") {
        if(product.productStock < productDetails.productQuantity) {
            return res.status(400).json({message: 'Insufficient product stock'});
        }
        product.productStock -= Number(productDetails.productQuantity);
        product.totalAmountSold = Number(product.totalAmountSold || 0) + Number(amount);
    }
    product.lastUpdatedBy = userId;
    product.lastUpdatedAt = new Date().toISOString();
    const response = await Database.executePutCommand(tables.PRODUCTS, product);
    const updatedAllProducts = await Database.executeScanCommand(tables.PRODUCTS);
    const updatedProduct = updatedAllProducts.find(updatedProduct => updatedProduct.product_id === product.product_id);
    if(response.httpStatusCode === 200) {
        const orderId = Util.generateOrderId();
        const order = {
            order_id: orderId,
            orderDetails: {
                productId: updatedProduct.product_id,
                quantity: productDetails.productQuantity,
                unitPrice: productDetails.unitPrice,
                totalOrderAmount: Number(productDetails.unitPrice * productDetails.productQuantity),
                requestType: productDetails.requestType,
            }
        };
        const updOrdersResponse = await Database.executePutCommand(tables.ORDERS, order);
        const allOrders = await Database.executeScanCommand(tables.ORDERS);

        return res.status(200).json({message: `Successfully updated product: ${product.productName}`,
                                                allProducts:updatedAllProducts,
                                                product:updatedProduct,
                                                allOrders:allOrders});
    }
});
module.exports = router;