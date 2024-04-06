const express = require('express');
const router = express.Router();

//middleware
router.get('/add-forum',(req,res,next) =>{
    res.send('<form action="/product" method="POST"><input type="text" name="title"><button type="submit">Add Product</button></form>');
});

router.post('/product', (req,res,next)=> {
    console.log(req.body);
    res.redirect('/');
});

module.exports = router //이걸로 post,get등 위에서 정의한 걸 내보냄.