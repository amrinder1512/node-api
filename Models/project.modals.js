
const mongoose =require("mongoose");
const projectSchema =mongoose.Schema(
    {
        _id:{type:Number},
        employee_name:{type:String, required: [true, "Please enter your name"]},
        projects:{type:String}, 
       
    }
);
const project= mongoose.model ("project", projectSchema);
module.exports=project;
