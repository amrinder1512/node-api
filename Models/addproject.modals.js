const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const { v4: uuidv4 } = require("uuid");

const projectSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    project_id: { type: String, unique: true, default: uuidv4 },
    project_name: { type: String, required: true },
    project_description: { type: String },
  },
  {
    timestamps: true,
    _id: false, // Disable default auto-generated ObjectId
  }
);

projectSchema.plugin(AutoIncrement, { id: 'project_seq', inc_field: '_id' });

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
