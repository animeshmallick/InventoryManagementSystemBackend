const Database = require('../config/DynamoDB');
const Token = require('../internal/token');
const express = require('express');
const tables = require("../data/DynamoDBTables");

const router = express.Router();

router.post('/', Token.verifyToken, async function(req, res) {
    const allProducts = await Database.executeScanCommand(tables.PRODUCTS);
    return res.status(200).json(allProducts);
})
module.exports = router;