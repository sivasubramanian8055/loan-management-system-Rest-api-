const UserModel = require('../users/models/users.model');
const jwt=require('jsonwebtoken');
const mongoose = require("mongoose");
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const chShould = chai.should();
const config = require('../common/config/env.config.js');
const User=require('../users/models/users.model.js');
const adminInfo={email:"test@gmail.com",password:"myadminaccess"}
const otherUserInfo={firstName:"test",lastName:"v",email:"testers@gmail.com",password:"test123"}
const agentInfo={firstName:"test",lastName:"v",email:"test1@gmail.com",password:"test23"}
let otherJwtToken
let adminJwtToken
let agentJwtToken
let userId

chai.use(chaiHttp);

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

describe('User Testing',()=>{
  before(async ()=>{
    const info={
firstName: "Admin",
lastName: "A",
email: "test@gmail.com",
password: "ari9Rs+tBQH/K44uLag+3w==$mfpX2F9+k6IcUhobKKODjR2QBlU/XVCtnzQsv6q65ivcKjhM4BaQXUUtTNI1wzNeCvEZrbh2ldkPoHwtrybjVQ==",
permissionLevel: config.permissionLevels.ADMIN
    }
    const admin=await User.findByEmail("test@gmail.com")
    if(!admin[0]){
          await User.createUser(info)
    }
     adminJwtToken=await getJWT(adminInfo)
  })

describe('customer signup scenario',()=>{

     const userInfoMissing={email:"testers@gmail.com",firstName:"test",password:"test1"}
    it('registeration of customer will fail due to missing field',(done)=>{
      chai.request(server)
               .post('/user/userRegister')
               .send(userInfoMissing)
               .end((err, res) => {
                  res.should.have.status(400)
                  done()
               })
    })
    it('successful customer creation',(done)=>{
      chai.request(server)
               .post('/user/userRegister')
               .send(otherUserInfo)
               .end((err, res) => {
                  res.should.have.status(201)
                  done()
               })
    })
    it('Duplicate customer can not be created',(done)=>{
      chai.request(server)
               .post('/user/userRegister')
               .send(otherUserInfo)
               .end((err, res) => {
                  res.should.have.status(409)
                  done()
               })
    })
})

describe('Admin operations',()=>{

    it('Agent cannot be created by others',(done)=>{
      chai.request(server)
               .post('/user/agentRegister')
               .send(agentInfo)
               .set({ "Authorization": `Bearer ${otherJwtToken}` })
               .end((err, res) => {
                  res.should.have.status(403)
                  done()
               })
    })
    it('successful agent creation by admin',(done)=>{
      chai.request(server)
               .post('/user/agentRegister')
               .send(agentInfo)
               .set({ "Authorization": `Bearer ${adminJwtToken}` })
               .end((err, res) => {
                  res.should.have.status(201)
                  done()
               })
    })
    it('creating of agent is not possible without admin jwt',(done)=>{
      chai.request(server)
               .post('/user/agentRegister')
               .send(agentInfo)
               .end((err, res) => {
                  res.should.have.status(401)
                  done()
               })
    })
})

describe('List Users',()=>{

    before(async()=>{
      agentJwtToken=await getJWT(agentInfo)
      otherJwtToken=await getJWT(otherUserInfo)
    })
    it('Listing of users cannot be done by customers',(done)=>{
      chai.request(server)
               .get('/user/users')
               .set({ "Authorization": `Bearer ${otherJwtToken}` })
               .end((err, res) => {
                  res.should.have.status(403)
                  done()
               })
    })
    it('Listing of users can be done by agent',(done)=>{
      chai.request(server)
               .get('/user/users')
               .set({ "Authorization": `Bearer ${agentJwtToken}` })
               .end((err, res) => {
                  res.should.have.status(200)
                  done()
               })
    })
    it('Listing of users can be done by admin',(done)=>{
      chai.request(server)
               .get('/user/users')
               .set({ "Authorization": `Bearer ${adminJwtToken}` })
               .end((err, res) => {
                  res.should.have.status(200)
                  done()
               })
    })
    it('Listing of users cannot be done without JWT',(done)=>{
      chai.request(server)
               .get('/user/users')
               .end((err, res) => {
                  res.should.have.status(401)
                  done()
               })
    })
})

describe('List Users details alone',()=>{

     let other2JwtToken

     before(async ()=>{
       let result=await UserModel.findByEmail(otherUserInfo.email)
        userId=result[0]._id
       // creating an user
        other2JwtToken=await createUser({firstName:"test",lastName:"v",email:"testers123@gmail.com",password:"test1412"})
     })

     after((done) => {
          UserModel.deleteUser("testers123@gmail.com")
        done();
    });

    it('customers can look into their own details',(done)=>{
      chai.request(server)
               .get(`/user/users/${userId}`)
               .set({ "Authorization": `Bearer ${otherJwtToken}` })
               .end((err, res) => {
                  res.should.have.status(200)
                  done()
               })
    })
    it('customers cannot look into other customer details',(done)=>{
      chai.request(server)
               .get('/user/users')
               .query({userId:userId})
               .set({ "Authorization": `Bearer ${other2JwtToken}` })
               .end((err, res) => {
                  res.should.have.status(403)
                  done()
               })
    })
    it('admin can look into specific customers details',(done)=>{
      chai.request(server)
               .get('/user/users')
               .query({userId:userId})
               .set({ "Authorization": `Bearer ${adminJwtToken}` })
               .end((err, res) => {
                  res.should.have.status(200)
                  done()
               })
    })

})

describe('Patch user details',()=>{
  let adminId
  after((done)=>{
    UserModel.deleteUser(agentInfo.email)
    UserModel.deleteUser(otherUserInfo.email)
    done()
  })
    before(async ()=>{
      let res=await UserModel.findByEmail('test@gmail.com')
        adminId=res._id
    })

    it('Admin details cannot be patched by anyone',(done)=>{
      chai.request(server)
               .patch(`/user/users/${adminId}`)
               .send({firstName:"jacob"})
               .set({ "Authorization": `Bearer ${agentJwtToken}` })
               .end((err, res) => {
                  res.should.have.status(403)
               })
      done()
    })
    it('only admin and agent can change customer details',(done)=>{
      chai.request(server)
               .patch(`/user/users/${userId}`)
               .send({firstName:"jacob"})
               .set({ "Authorization": `Bearer ${agentJwtToken}` })
               .end((err, res) => {
                  res.should.have.status(200)
               })
      done()
    })
    it('customer details have been patched',(done)=>{
      chai.request(server)
               .get(`/user/users/${userId}`)
               .set({ "Authorization": `Bearer ${adminJwtToken}` })
               .end((err, res) => {
                   res.should.have.status(200)
                   res.body.firstName.should.be.eql("jacob")
               })
      done()
    })


})
})
