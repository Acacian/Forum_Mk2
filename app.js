const path = require('path'); //경로 추가
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const MongoConnect = require('./util/database') // DB연결 추가

// express setting
const app = express();

// ejs add to use view engine
app.set('view engine','ejs');
app.set('views','views');

// http내장모듈 없이 이벤트 등록을 자동으로 해 줌. 만약 여기서 true를 하면 추가로 설치가 필요한 qs모듈을 쓰고, 아니면 기본 내장된 쿼리스트링 모듈을 씀
app.use(bodyParser.urlencoded({extended: false}));
// 정적 파일 서비스
app.use(express.static(path.join(__dirname,'public')));
// 404 error
app.use(errorController.get404);

// server start
MongoConnect(client =>{
    console.log(client);
    app.listen(3000);
})