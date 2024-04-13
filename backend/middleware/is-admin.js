const User = require('../models/user');

module.exports = async (req, res, next) => {
    //check login user is admin
    try{
        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }
        if(user.admin === true){
            next();
        }else{
            res.status(403).json({
                message: 'Admin 권한이 없습니다.', 
                user_id: req.userId
            });
        }
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};
