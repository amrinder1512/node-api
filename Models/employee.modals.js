const mongoose =require("mongoose");
const userSchema =mongoose.Schema(
    {
        _id:{type:Number},
        employee_id:{type:Number, unique: true},
        employee_name:{type:String, required: [true, "Please enter your name"]},
        project_id:{type:Number}, 
        description:{type:String}
    },
  
);
const user= mongoose.model ("user", userSchema);
module.exports=user;
