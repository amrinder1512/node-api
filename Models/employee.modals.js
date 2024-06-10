const mongoose =require("mongoose");
const userSchema =mongoose.Schema(
    {
        
        employee_id:{type:Number, unique: true},
        employee_name:{type:String, required: [true, "Please enter your name"]}
    },
  
);
const user= mongoose.model ("user", userSchema);
module.exports=user;
