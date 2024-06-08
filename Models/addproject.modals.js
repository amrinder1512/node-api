
const mongoose =require("mongoose");
const projectSchema =mongoose.Schema(
    {
        project_id:{type:Number, unique:true},
        project_name:{type:String , required:[true]},
        project_description:{type:String}
    }
    ,{
        timestamp:true
    }
);
const project= mongoose.model ("project", projectSchema);
module.exports=project;
