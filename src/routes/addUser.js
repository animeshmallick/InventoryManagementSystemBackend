const Database = require('../config/DynamoDB');
const express = require('express');
const router = express.Router();
router.post('/',async function(req,res,next){
    const userDetails = req.body;
    const user = {
        user_id: userDetails.user_id,
        userName: userDetails.userName,
        phone: userDetails.phone,
        password: userDetails.password,
        role: userDetails.role,
    }
    const response = await Database.executePutCommand("IMS_Users",user);
    const allUsers = await Database.executeScanCommand("IMS_Users");
    if(response.httpStatusCode === 200)
        return res.status(200).json({message:`User ${user.user_id} Added Successfully`, data: allUsers});
})
module.exports = router;