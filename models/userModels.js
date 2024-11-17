const mongoose=require("mongoose");

const sellerSchema=mongoose.Schema({

    username:{
        type:String,
        required:[true,"Please add the username"]
    },
    email:{
        type:String,
        required:[true,"Please add the email"],
        unique:[true,"Email already registered"]
    },
    password:{
        type:String,
        required:[true,"Please add user password"]
    },
    token:{
        type:String,
        default:''
    },
},
{
    timestamps:true,
}

)

module.exports=mongoose.model("Seller",sellerSchema);