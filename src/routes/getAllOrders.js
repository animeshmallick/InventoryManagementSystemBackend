const Token = require("../internal/token");
const Database = require("../config/DynamoDB");
const tables = require("../data/DynamoDBTables");
const express = require("express");

const router = express.Router();

router.post("/", Token.verifyToken, async (req, res) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({success: false, message: "User Authorization failed"});
    const allOrders = await Database.executeScanCommand(tables.ORDERS);
    const allProducts = await Database.executeScanCommand(tables.PRODUCTS);

    const productMap = allProducts.reduce((acc, product) => {
        acc[product.product_id] = product.productName;
        return acc;
    });
    const updatedOrders = allOrders.map((order) => ({
        ...order,
        productName: productMap[order.product_id]
    }));
    return res.status(200).json({success: true, allOrders: updatedOrders});
})
module.exports = router;