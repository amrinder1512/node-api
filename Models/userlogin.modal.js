const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define the schema
const loginSchema = new mongoose.Schema(
    {
        useremail: {
            type: String,
            required: [true, "Please enter your e-mail"],
            unique: true,
            match: [/\S+@\S+\.\S+/, "Please enter a valid email"]
        },
        userpassword: {
            type: String,
            required: [true, "Please enter your password"]
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt fields
    }
);

// Pre-save hook to hash the password before saving
loginSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Create the model
const UserLogin = mongoose.model("Login", loginSchema);

// Export the model
module.exports = UserLogin;
