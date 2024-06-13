const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    employee_id: { type: String, unique: true, default: uuidv4 },
    employee_name: { type: String, required: [true, "Please enter your name"] },
    employee_email: { type: String, required: [true, "Please enter your email"], unique: true },
    employee_phone: { type: String, required: [true, "Please enter your phone"], unique: true },
    employee_address: { type: String, required: [true, "Please enter your address"] },
  },
  {
    timestamps: true,
    _id: false, // Disable default auto-generated ObjectId
  }
);

userSchema.plugin(AutoIncrement, { id: 'employee_seq', inc_field: '_id' });

const User = mongoose.model("User", userSchema);

module.exports = User;
