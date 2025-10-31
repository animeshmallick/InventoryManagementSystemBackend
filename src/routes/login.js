const Token = require('../internal/token.js');
const express = require('express');
const Database = require('../config/DynamoDB');

const router = express.Router();
router.post('/', async function (req, res, next) {
    const loginDetails = req.body;
    if (!loginDetails.phone || !loginDetails.password) {
        return res.status(401).json({message: 'Missing credentials'});
    }
    const allUsers = await Database.executeScanCommand("IMS_Users");
    const validUser = allUsers.find(user => user.phone === loginDetails.phone && user.password === loginDetails.password);
    if (!validUser)
        return res.status(400).json({message: 'Invalid credentials'});
    const authToken = Token.getToken(validUser.user_id, validUser.role);

    //Set cookie
    res.cookie("token", authToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 60 * 60 * 1000,
    });
    return res.status(200).json({
        success: true,
        message:"Login Successful",
        user:{userId:validUser.user_id, userRole:validUser.role}
    });
});

// Verify route (check cookie validity)
router.post("/verify", Token.verifyToken, (req, res) => {
    res.json({
        success: true,
        loggedIn: true,
        user: { userId: req.userId, userRole: req.userRole },
    });
});

// Logout route
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out successfully" });
});
module.exports = router;