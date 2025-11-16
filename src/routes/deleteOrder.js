const Token = require("../internal/token");
const Database = require("../config/DynamoDB");
const express = require("express");
const tables = require("../data/DynamoDBTables");

const router = express.Router();
router.post("/:orderId", Token.verifyToken, async (req, res) => {
    const userId = req.userId;
    const userRole = req.userRole;
    const orderId = req.params.orderId;

    if(!userId) return res.status(401).json({success: false, message: 'User Authorization failed'});
    if(!orderId) return res.status(400).json({success: false, message: 'Order ID missing or invalid'});
    const orderDetails = await Database.executeGetCommand(tables.ORDERS, {order_id: orderId});
    const deleteOrderResponse = await Database.executeDeleteCommand(tables.ORDERS, {order_id: orderId});
    const productDetails = await Database.executeGetCommand(tables.PRODUCTS,{product_id: orderDetails.productId});
    if(orderDetails.requestType === "sell") {
        productDetails.productStock += orderDetails.quantity;
        productDetails.totalAmountSold -= orderDetails.totalOrderAmount;
    }else if (orderDetails.requestType === "procure") {
        productDetails.productStock -= orderDetails.quantity;
        productDetails.totalAmountProcured -= orderDetails.totalOrderAmount;
    }
    const updatedProductResponse = await Database.executePutCommand(tables.PRODUCTS, productDetails);
    return res.status(200).json({success: true, message: "Order deleted successfully"});
})
module.exports = router;