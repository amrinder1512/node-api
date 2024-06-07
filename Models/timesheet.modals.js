const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
  {
    _id: { type: Number },
    employee_id:{ type: Number, unique: true},
    employee_name: { type: String, required: [true, "Please enter your name"] },
  },
  { timestamps: true }
);
const timesheet = mongoose.model("timesheet", userSchema);
module.exports = timesheet;
