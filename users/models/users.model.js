const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName:      {type:String,required:true},
    lastName:       {type:String,required:true},
    email:          {type:String,required:true},
    password:       {type:String,required:true},
    permissionLevel:{type:Number,required:true},
    loans: [
   {
     type: mongoose.Schema.Types.ObjectId,
     ref: "Loan",
   },
 ]
},
{
    timestamps: true
});

const User = mongoose.model('Users', userSchema);

exports.findByEmail = (email) => {
    return User.find({email: email});
};

exports.findById = (id) => {
    return User.findById(id)
        .then((result) => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            return result;
        });
};

exports.createUser = (userData) => {
    const user = new User(userData);
    return new Promise((resolve, reject) => {
            user.save((err,res)=>{
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            })
    });
};

exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        User.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, users) {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            })
    });
};

exports.patchUser = (id, userData) => {
    return User.findOneAndUpdate({
        _id: id
    }, userData);
};
exports.deleteUser=(_email)=>{
  return User.deleteOne({"email":_email}, function (err) {
  if(err) console.log(err);
  })
}
