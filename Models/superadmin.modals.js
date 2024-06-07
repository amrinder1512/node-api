const mongoose =require("mongoose");
const superAdminSchema =mongoose.Schema(
    {
        email:{type:String, required :[true, "Please enter your e-mail"],unique:true},
        password:{type:String, required: [true, "Please enter your password"]}
       
    }
);
const SuperAdmin= mongoose.model ("SuperAmdin", superAdminSchema);
module.exports=SuperAdmin;
