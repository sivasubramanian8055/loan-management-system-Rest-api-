const UserModel = require('../users/models/users.model');
const LoanModel = require('../loan/models/loan.model');
const jwt=require('jsonwebtoken');
const mongoose = require("mongoose");
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const chShould = chai.should();
chai.use(chaiHttp)
const adminInfo={email:"test@gmail.com",password:"myadminaccess"}
const otherUserInfo={firstName:"test",lastName:"v",email:"testers@gmail.com",password:"test123"}
const otherUser2Info={firstName:"test",lastName:"v",email:"testerss@gmail.com",password:"test123"}
const agentInfo={firstName:"test",lastName:"v",email:"test1@gmail.com",password:"test23"}

let otherJwtToken
let adminJwtToken
let agentJwtToken
let loanId
let loanId2

const getJWT=async (info)=>{
  const res= await chai.request(server)
      .post('/auth')
      .send(info)
    return res.body.accessToken;
}


const createUser=async (info)=>{

 const res=await chai.request(server)
      .post('/user/userRegister')
      .send(info)
      return res.body.id
}

const createLoan=async (info,token)=>{
  const res= await chai.request(server)
           .post('/loan/createLoan')
           .send(info)
           .set({ "Authorization": `Bearer ${token}` })
    return res.body.id;
}

describe('loan testing',()=>{

before(async ()=>{
      adminJwtToken=await getJWT(adminInfo)
      await chai.request(server)
               .post('/user/agentRegister')
               .send(agentInfo)
               .set({ "Authorization": `Bearer ${adminJwtToken}` })
     agentJwtToken=await getJWT(agentInfo)
      await createUser(otherUserInfo)
      otherJwtToken=await getJWT(otherUserInfo)
})

  after((done)=>{
  UserModel.deleteUser(agentInfo.email)
  UserModel.deleteUser(otherUserInfo.email)
  UserModel.deleteUser(otherUser2Info.email)
  LoanModel.deleteLoan(loanId)
  LoanModel.deleteLoan(loanId2)
  done()
  })

  describe('Loan Creation',()=>{
    const correctLoanDetails={principle:15000,monthsToRepay:5,loanType:"AGRI",applicantEmail:otherUserInfo.email}
    const invalidLoanDetails ={principle:15000,monthsToRepay:5,loanType:"AGRI",applicantEmail:"phoenix@gmail.com"}
  const incorrectLoanDetails={principle:15000,monthsToRepay:5,applicantEmail:otherUserInfo.email}
     it('Loan application cannot be done by customers',(done)=>{
       chai.request(server)
                .post('/loan/createLoan')
                .send(correctLoanDetails)
                .set({ "Authorization": `Bearer ${otherJwtToken}` })
                .end((err, res) => {
                   res.should.have.status(403)
                })
        done()
     })
      it('Loan application can be done by agent for an existing customer',async()=>{
       let res=await chai.request(server)
                .post('/loan/createLoan')
                .send(correctLoanDetails)
                .set({ "Authorization": `Bearer ${agentJwtToken}` })
                loanId=res.body.id
                res.should.have.status(200)
     })
      it('Loan application cannot be done by admin',(done)=>{
       chai.request(server)
                .post('/loan/createLoan')
                .send(correctLoanDetails)
                .set({ "Authorization": `Bearer ${adminJwtToken}` })
                .end((err, res) => {
                   res.should.have.status(403)
                })
      done()
     })
     it('Loan creation cannot be done with insufficient data',(done)=>{
       chai.request(server)
                .post('/loan/createLoan')
                .send(incorrectLoanDetails)
                .set({ "Authorization": `Bearer ${agentJwtToken}` })
                .end((err, res) => {
                   res.should.have.status(400)
                })
        done()
     })
     it('Loan creation for non-existing customer fails',(done)=>{
       chai.request(server)
                .post('/loan/createLoan')
                .send(invalidLoanDetails)
                .set({ "Authorization": `Bearer ${agentJwtToken}` })
                .end((err, res) => {
                   res.should.have.status(404)
                })
      done()
     })

  })
  describe('List Loans',()=>{

      it('Listing of Loans cannot be done by customers',(done)=>{
        chai.request(server)
                 .get('/loan/loans')
                 .set({ "Authorization": `Bearer ${otherJwtToken}` })
                 .end((err, res) => {
                    res.should.have.status(403)
                    done()
                 })
      })
      it('Listing of loans can be done by agent',(done)=>{
        chai.request(server)
                 .get('/loan/loans')
                 .set({ "Authorization": `Bearer ${agentJwtToken}` })
                 .end((err, res) => {
                    res.should.have.status(200)
                    done()
                 })
      })
      it('Listing of loans can be done by admin',(done)=>{
        chai.request(server)
                 .get('/loan/loans')
                 .set({ "Authorization": `Bearer ${adminJwtToken}` })
                 .end((err, res) => {
                    res.should.have.status(200)
                    done()
                 })
      })
      it('Listing of loan cannot be done without JWT',(done)=>{
        chai.request(server)
                 .get('/loan/loans')
                 .end((err, res) => {
                    res.should.have.status(401)
                    done()
                 })
      })
  })
  describe('Loan View ',()=>{

     it('Loan Details cannot be viewed by Customers',(done)=>{
       chai.request(server)
                .get(`/loan/${loanId}`)
                .set({ "Authorization": `Bearer ${otherJwtToken}` })
                .end((err, res) => {
                   res.should.have.status(403)
                })
        done()
     })
     it('Loan Details can be viewed by Agent',(done)=>{
       chai.request(server)
                .get(`/loan/${loanId}`)
                .set({ "Authorization": `Bearer ${agentJwtToken}` })
                .end((err, res) => {
                   res.should.have.status(200)
                })
        done()
     })
     it('Loan Details can be viewed by Admin',(done)=>{
       chai.request(server)
                .get(`/loan/${loanId}`)
                .set({ "Authorization": `Bearer ${adminJwtToken}` })
                .end((err, res) => {
                   res.should.have.status(200)
                })
       done()
     })
    })

  describe('Loan Filter ',()=>{
     const LoanDetails={principle:25000,monthsToRepay:5,loanType:"AGRI",applicantEmail:otherUser2Info.email}
     const filter1={status:"NEW"}
     const filter2={principle:25000}
     before(async()=>{
       await createUser(otherUser2Info)
       loanId2=await createLoan(LoanDetails,agentJwtToken)
     })
     it('Customers can only filter their loans',(done)=>{
       chai.request(server)
                .post('/loan/filter')
                .send(filter1)
                .set({ "Authorization": `Bearer ${otherJwtToken}` })
                .end((err, res) => {
                   res.should.have.status(200)
                   res.body.length.should.be.eql(1)
                })
        done()
     })
     it('Agent can filter every loan',(done)=>{
       chai.request(server)
                .post('/loan/filter')
                .send(filter1)
                .set({ "Authorization": `Bearer ${agentJwtToken}` })
                .end((err, res) => {
                   res.should.have.status(200)
                   res.body.length.should.be.eql(2)
                })
        done()
     })
    it('Admin can filter every loan',(done)=>{
       chai.request(server)
                .post('/loan/filter')
                .send(filter1)
                .set({ "Authorization": `Bearer ${adminJwtToken}` })
                .end((err, res) => {
                   res.should.have.status(200)
                   res.body.length.should.be.eql(2)
                })
        done()
     })
    it('Filter query with constraints work well',(done)=>{
       chai.request(server)
                .post('/loan/filter')
                .send(filter2)
                .set({ "Authorization": `Bearer ${adminJwtToken}` })
                .end((err, res) => {
                   res.should.have.status(200)
                })
       done()
     })
    })

    describe('Patch Loan details',()=>{

        it('Agent cannot patch status of Loan',(done)=>{
          chai.request(server)
                   .patch(`/loan/editLoan/${loanId}`)
                   .send({status:"APPROVED"})
                   .set({ "Authorization": `Bearer ${agentJwtToken}` })
                   .end((err, res) => {
                      res.should.have.status(403)
                   })
          done()
        })
        it('Agent can patch other details of Loan',(done)=>{
          chai.request(server)
                   .patch(`/loan/editLoan/${loanId}`)
                   .send({loanType:"EDU.LOAN"})
                   .set({ "Authorization": `Bearer ${agentJwtToken}` })
                   .end((err, res) => {
                      res.should.have.status(200)
                   })
          done()
        })
        it('Admin cannot patch other details',(done)=>{
          chai.request(server)
                   .patch(`/loan/editLoan/${loanId}`)
                   .send({loanType:"EDU.LOAN"})
                   .set({ "Authorization": `Bearer ${adminJwtToken}` })
                   .end((err, res) => {
                      res.should.have.status(403)
                   })
          done()
        })
        it('Admin can only patch status of Loan',(done)=>{
          chai.request(server)
                   .patch(`/loan/editLoan/${loanId}`)
                   .send({status:"APPROVED"})
                   .set({ "Authorization": `Bearer ${adminJwtToken}` })
                   .end((err, res) => {
                      res.should.have.status(200)
                   })
          done()
        })
        it('Loan details have been patched',(done)=>{
          chai.request(server)
                   .get(`/loan/${loanId}`)
                   .set({ "Authorization": `Bearer ${agentJwtToken}` })
                   .end((err, res) => {
                      res.should.have.status(200)
                      res.body.loanType.should.be.eql("EDU.LOAN")
                   })
          done()
        })
      })

})
