const mongoose =require("mongoose");
const AdminSchema =mongoose.Schema(
    {
        email:{type:String, required :[true, "Please enter your e-mail"] ,index:{unique:true}},
        password:{type:String, required: [true, "Please enter your password"]}
       
    }
);
const Admin= mongoose.model ("Amdin", AdminSchema);
module.exports=Admin;
