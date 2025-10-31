const jwt = require('jsonwebtoken');
const SECRET = 'default_secret_key';

class Token {
    getToken(userId,role){
        return jwt.sign({user_id:userId, role:role}, SECRET,{expiresIn: '12h'});
    }

    //Middleware:Verify Token from cookie
    verifyToken(req,res,next){
        let token;
        if (req.cookies && req.cookies.token)
            token = req.cookies.token;
        if(!token)
            return res.status(403).json({message: "Authorization Token Missing"});

        jwt.verify(token, SECRET, (err, user) => {
            if(err){
                return res.status(401).json({message:"Invalid Authorization Token"});
            }
            req.userId = user.user_id;
            req.userRole = user.role;
            next();
        });
    }
}
module.exports = new Token();