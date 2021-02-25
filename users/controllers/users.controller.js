const UserModel = require('../models/users.model');
const crypto = require('crypto');

exports.insert = (req, res) => {
    UserModel.findByEmail(req.body.email).then((user)=>{
        if(!user[0]){
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
    req.body.password = salt + "$" + hash;
    req.body.permissionLevel = 1;
    UserModel.createUser(req.body)
        .then((result) => {
            res.status(201).send({id: result._id});
        }).catch((err)=>{
          res.status(400).send({message:err.message});
        });
    }
    else{
      res.status(409).send({reason:"User already exist!"});
    }
});
}
exports.insertAgent= (req, res) => {
    UserModel.findByEmail(req.body.email).then((user)=>{
        if(!user[0]){
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
    req.body.password = salt + "$" + hash;
    req.body.permissionLevel = 4;
    UserModel.createUser(req.body)
    .then((result) => {
        res.status(201).send({id: result._id});
    }).catch((err)=>{
      res.status(400).send({message:err.message});
    });
    }
    else{
      res.status(409).send({reason:"User already exist!"});
    }
});
}
exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    UserModel.list(limit, page)
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.getById = (req, res) => {
    UserModel.findById(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        });
};
exports.patchById = (req, res) => {
    if (req.body.password) {
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
        req.body.password = salt + "$" + hash;
    }
    UserModel.findById(req.params.userId)
      .then((result)=>{
        if(result.email==="test@gmail.com")
        res.status(403).send({});
        else
        UserModel.patchUser(req.params.userId, req.body)
            .then((result) => {
                res.status(200).send({});
            });
      })



};
