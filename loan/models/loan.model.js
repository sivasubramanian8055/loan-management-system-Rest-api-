const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const loanSchema = new Schema({
  user:            {type: String, required:true,immutable:true},
  principle:       {type: Number, required: true,immutable:true},
  interestRate:    {type: Number},
  monthsToRepay:   {type: Number,required: true},
  repaymentAmount: {type: Number},
  emi:             {type: Number},
  history:         [{type: Object,}],
  status:          {type: String, enum: ["NEW", "REJECTED", "APPROVED"]},
  loanType:        {type: String,required: true}
},
{
    timestamps: true
});
const Loan = mongoose.model('Loan', loanSchema);
exports.createLoan = (loanData) => {
    const loan = new Loan(loanData);
    return new Promise((resolve, reject) => {
            loan.save((err,res)=>{
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            })
    });
};
exports.patchLoan = (id, loanData) => {
    return Loan.findOneAndUpdate({
        _id: id
    }, loanData);
};
exports.findById = (id) => {
    return Loan.findById(id)
        .then((result) => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            return result;
        });
};
exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        Loan.find()
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
exports.filter = async (data) => {
    const result=await Loan.find(data)
    return result
};

exports.deleteLoan=(id)=>{
  return Loan.findOneAndDelete({_id:id}, function (err) {
  if(err) console.log(err);
  })
}
