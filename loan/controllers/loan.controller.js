const LoanModel = require('../models/loan.model');
const UserModel = require('../../users/models/users.model');
const config = require('../../common/config/env.config.js');


function InterestCalculator(principle){
    if(principle>=10000 && principle<50000){
        return 0.04;
    }
    else if(principle>=50000 && principle<100000){
        return 0.06;
    }

    else if(principle>=10000){
        return 0.11;
    }
}
exports.createLoan = async(req, res) => {
    const user=await UserModel.findByEmail(req.body.applicantEmail)
      if(!user[0]){
        res.status(404).send({reason:"User doesnot exist!"})
      }
      else{
      if(req.body.principle<10000){
        res.status(400).send({reason:"principle amount too low"})
      }
      let jsonObj=req.body
      jsonObj['interestRate'] = InterestCalculator(req.body.principle)
      jsonObj['user'] = req.body.applicantEmail
      jsonObj['status'] = "NEW"
      jsonObj['repaymentAmount'] = jsonObj['principle']+(jsonObj['principle']*jsonObj['interestRate'])
      jsonObj['emi']=jsonObj['repaymentAmount']/jsonObj['monthsToRepay']
       LoanModel.createLoan(jsonObj).then((result)=>{
         user[0].loans.unshift(result)
         user[0].save()
         res.status(200).send({id:result._id,message:"Loan created"})
       }).catch((err)=>{
         res.status(400).send({message:err.message});
       })
     }
};
exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    LoanModel.list(limit, page)
        .then((result) => {
            res.status(200).send(result);
        })
};
exports.patchByLoanId = async(req, res) => {
     const loan=await LoanModel.findById(req.params.loanId)
    if(loan.status!=="NEW")
    res.status(403).send({reason:"Loan can be modified only in NEW state"})
    else{
    const keys=Object.keys(req.body)
    if((keys.includes("status") && keys.length==1) ^ parseInt(req.jwt.permissionLevel)!==config.permissionLevels.AGENT)
    res.status(403).send({reason:"ADMIN can only modify status and he cannot modify anything else!"})
    else
    {
    let hist=loan.history
    let entries=JSON.stringify(req.body)
    hist.push({dat:entries,ts:new Date().toISOString()})
    req.body["history"]=hist
    LoanModel.patchLoan(req.params.loanId,req.body)
        .then((result) => {
            res.status(200).send(result);
        });
   }
 }
};

exports.getByLoanId = (req, res) => {
    LoanModel.findById(req.params.loanId)
        .then((result) => {
            res.status(200).send(result);
        });
};

exports.filterBy = async(req, res) => {

    if(parseInt(req.jwt.permissionLevel)===config.permissionLevels.CUSTOMER)
    LoanModel.filter({[req.body.key]:req.body.value,user:req.jwt.email})
        .then((result) => {
            res.status(200).send(result);
        });
    else
    LoanModel.filter({[req.body.key]:req.body.value})
        .then((result) => {
            res.status(200).send(result);
        });
};
