const config = require('./common/config/env.config.js');
const User=require('./users/models/users.model.js');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const AuthorizationRouter = require('./authorization/routes.config');
const UsersRouter = require('./users/routes.config');
const LoanRouter = require('./loan/routes.config');

app.get('/',(req,res)=>{
res.send("HELLO");
});

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    } else {
        return next();
    }
});

app.use(bodyParser.json());
AuthorizationRouter.routesConfig(app);
UsersRouter.routesConfig(app);
LoanRouter.routesConfig(app);


            const info={
  	firstName: "Admin",
    	lastName: "A",
    	email: "test@gmail.com",
    	password: "ari9Rs+tBQH/K44uLag+3w==$mfpX2F9+k6IcUhobKKODjR2QBlU/XVCtnzQsv6q65ivcKjhM4BaQXUUtTNI1wzNeCvEZrbh2ldkPoHwtrybjVQ==",
    	permissionLevel: config.permissionLevels.ADMIN
            }
            const admin=User.findByEmail("test@gmail.com").then((user)=>{
                if(!user[0]){
                  User.createUser(info)
                }});

app.listen(config.port, function () {
    console.log('app listening at port %s', config.port);
});

module.exports=app
