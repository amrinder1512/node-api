const mongoose =require("mongoose");
const loginSchema =mongoose.Schema(
    {
        email:{type:String, required :[true, "Please enter your e-mail"] ,index:{unique:true}},
        password:{type:String, required: [true, "Please enter your password"]}
       
    }
);
const login= mongoose.model ("login", loginSchema);
module.exports=login;
