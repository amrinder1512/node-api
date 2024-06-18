const mongoose = require('mongoose');

const assignSchema = new mongoose.Schema(
  {
    employee_id: {
      type: String,
      ref: 'User',
      required: true,
    },
    project_id: [
      {
        type: String,
        ref: 'Project',
        required: true,
        
      },
    ],
  },
  {
    timestamps: true,
    _id:true, type: String
  }
);

const Assign = mongoose.model('Assign', assignSchema);

module.exports = Assign;
