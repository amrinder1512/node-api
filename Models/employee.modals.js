const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

// Define the schema
const userSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    employee_id: { type: String, unique: true, default: uuidv4 },
    employee_name: { type: String, required: [true, "Please enter your name"] },
    employee_email: { 
      type: String, 
      required: [true, "Please enter your email"], 
      unique: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email"] // Email format validation
    },
    employee_password: { 
      type: String, 
      required: [true, "Please enter your password"]
    },
    employee_phone: { 
      type: String, 
      required: [true, "Please enter your phone"], 
      unique: true,
      match: [/^\d{10}$/, "Please enter a valid phone number"] // Phone number validation (example: 10 digits)
    },
    employee_address: { type: String, required: [true, "Please enter your address"] },
  },
  {
    timestamps: true,
    _id: false, // Disable default auto-generated ObjectId
  }
);

// Apply auto-increment plugin
userSchema.plugin(AutoIncrement, { id: 'employee_seq', inc_field: '_id' });

// Pre-save hook to hash the password
userSchema.pre("save", async function (next) {
  if (!this.isModified("employee_password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.employee_password = await bcrypt.hash(this.employee_password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Create the model
const User = mongoose.model("User", userSchema);

// Export the model
module.exports = User;
