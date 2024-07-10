const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema(
  {
    employee_id: {
      type: String,
      required: true,
    },
    employee_name: {
      type: String,
      required: true,
      unique:false
    },
    project_id: {
      type: String, // Assuming it's an ObjectId referencing the Projects collection
      required: true,
    },
    project_name: {
      type: String,
      required: true,
    },
    project_description: {
      type: String,
      required: true,
    },
    total_working_hours: {
      type: Number,
      required: true,
    },
    dateTime: { 
      type: String, 
      required: true 
    }
  },
  { timestamps: true }
);
// Remove any existing unique index on employee_id
timesheetSchema.index({ employee_id: 1 }, { unique: false });

const Timesheet = mongoose.model('Timesheet', timesheetSchema);

module.exports = Timesheet;
