const mongoose =require("mongoose");
const AdminSchema =mongoose.Schema(
    {
        email:{type:String, required :[true, "Please enter your e-mail"] ,unique:true},
        password:{type:String, required: [true, "Please enter your password"]}
       
    }
);
const Admin= mongoose.model ("Amdin", AdminSchema);
module.exports=Admin;
