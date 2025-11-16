const Token = require("../internal/token");
const Database = require("../config/DynamoDB");
const express = require("express");
const tables = require("../data/DynamoDBTables");

const router = express.Router();
router.post("/:productId", Token.verifyToken, async (req, res) => {
    const userId = req.userId;
    const productId = req.params.productId;
    if(!userId) return res.status(401).json({success: false, message: 'User Authorization failed'});
    if(!productId) return res.status(400).json({success: false, message: 'Product ID missing or invalid'});

    const allTransactions = await Database.executeScanCommand(tables.ORDERS);
    const pastTransactions = allTransactions.filter(
        (t) => t.productId === productId
    );
    return res.status(200).json({transactions: pastTransactions ? pastTransactions : []});
})
module.exports = router;