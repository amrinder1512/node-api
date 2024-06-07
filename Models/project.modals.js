
const mongoose =require("mongoose");
const projectSchema =mongoose.Schema(
    {
        product_id:{type:Number, unique:true},
        employee_id:{type:Number, unique:true},
        projects:{type:String}
       
    }
);
const project= mongoose.model ("project", projectSchema);
module.exports=project;
