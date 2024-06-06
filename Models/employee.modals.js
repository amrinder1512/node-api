const mongoose =require("mongoose");
const userSchema =mongoose.Schema(
    {
        _id:{type:Number},
        employee_name:{type:String, required: [true, "Please enter your name"]},
        project:{type:String}, 
        description:{type:String}
    },
  
);
const user= mongoose.model ("user", userSchema);
module.exports=user;
