  const mongoose = require("mongoose");
  const userSchema = mongoose.Schema(
    {
      employeeName:{type : String},
      project:{type : String},
      description:{type : String},
      dateTime:{type : String}
    },
    { timestamps: true }
  );
  const timesheet = mongoose.model("timesheet", userSchema);
  module.exports = timesheet;
