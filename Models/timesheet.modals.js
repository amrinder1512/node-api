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
    project_name: {
      type: String,
      required: true,
    },
    project_description: {
      type: String,
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
