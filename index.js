const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const users = require("./Models/employee.modals");
const project = require("./Models/addproject.modals");
const Timesheet = require("./Models/timesheet.modals");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./authMiddleware");
const Assign = require("./Models/assign.modals");
const app = express();
const cors = require("cors");

const secretKey = "your-secret-key"; // Use a more secure key in production

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000", // React frontend
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

const mongoURI =
  "mongodb+srv://amrinder022000:15121999Amrinder@loginandmanagementsyste.rhriyb5.mongodb.net/LoginAndManagementSystem?retryWrites=true&w=majority&appName=LoginAndManagementSystem";

const superadminUser = {
  email: "superadmin@test.com",
  password: "superadmin@test.com",
  token: "some-jwt-token",
};

// Super Admin Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log("Received login request with:", { email, password });

  if (email === superadminUser.email && password === superadminUser.password) {
    const token = jwt.sign({ email }, secretKey, { expiresIn: "1h" });
    res.json({ token, data: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});




// Employee Login
app.post("/userslogin", async (req, res) => {
  const { employee_email, employee_password } = req.body;
  console.log("Received user login request with:", {
    employee_email,
    employee_password,
  });

  if (!employee_email || !employee_password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await users.findOne({ employee_email });
    if (!user) {
      console.log("User not found with email:", employee_email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("User found:", user);

    if (!user.employee_password) {
      console.log("User password is missing in database");
      return res.status(500).json({ message: "Internal server error" });
    }

    const isMatch = await bcrypt.compare(
      employee_password,
      user.employee_password
    );
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ email: employee_email }, secretKey, {
      expiresIn: "1h",
    });
    res.json({ token, data: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



// Logout 
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Could not log out.');
    }
    res.clearCookie('connect.sid');
    res.send('Logged out successfully!');
  });
});




// Logged in User timesheet
app.get("/timehistory", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching timesheets for employee_id:", req.userId); // Log the user ID
    const timesheets = await Timesheet.find({ employee_id: req.userId });
    console.log("Timesheets found:", timesheets);
    res.status(200).json(timesheets);
  } catch (error) {
    console.error("Error fetching timesheet history:", error);
    res.status(500).json({ error: "Failed to fetch timesheet history" });
  }
});




//Logged in user Dashboard 
app.get("/dashboards", authenticateToken, async (req, res) => {
  try {
    const user = await users.findOne({ employee_email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const assignments = await Assign.aggregate([
      { $match: { employee_id: user.employee_id } },
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "project_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $group: {
          _id: "$project.project_id",
          project_name: { $first: "$project.project_name" },
          // project_description: { $first: '$project.project_description' },
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id from results if needed
          project_id: "$_id",
          project_name: 1,
          project_description: 1,
        },
      },
    ]);

    res.json({
      name: user.employee_name,
      employee_id: user.employee_id,
      employee_email: user.employee_email,
      employee_phone: user.employee_phone,
      employee_address: user.employee_address,
      assignments,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
});




// Logged in UserProfile Info
app.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const user = await users.findOne({ employee_email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const assignments = await Assign.aggregate([
      { $match: { employee_id: user.employee_id } },
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "project_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $lookup: {
          from: "timesheets",
          let: { emp_id: "$employee_id", proj_id: "$project.project_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$employee_id", "$$emp_id"] },
                    { $eq: ["$project_id", "$$proj_id"] },
                  ],
                },
              },
            },
            {
              $project: {
                project_description: 1,
                total_working_hours: 1,
                dateTime: 1,
              },
            },
          ],
          as: "timesheets",
        },
      },
      { $unwind: { path: "$timesheets", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          assign_id: "$_id",
          employee_id: "$employee_id",
          employee_email: user.employee_email,
          employee_phone: user.employee_phone,
          employee_address: user.employee_address,
          project_id: "$project.project_id",
          project_name: "$project.project_name",
          project_description: "$timesheets.project_description",
          total_working_hours: {
            $ifNull: ["$timesheets.total_working_hours", 0],
          },
          dateTime: { $ifNull: ["$timesheets.dateTime", ""] },
        },
      },
    ]);

    console.log("Assignments:", assignments); // Log assignments for debugging

    res.json({
      name: user.employee_name,
      employee_id: user.employee_id,
      employee_email: user.employee_email,
      employee_phone: user.employee_phone,
      employee_address: user.employee_address,
      assignments,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
});




// Add Employee
app.post("/users", async (req, res) => {
  try {
    const newuser = await users.create(req.body); // Create a new user based on req.body
    res.status(201).json(newuser); // Respond with HTTP 201 and the created user object
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ error: "Server error" }); // Handle server errors
  }
});





// View Employee
app.get("/users", async (req, res) => {
  const newuser = await users.find();
  res.send(newuser);
});




//View Employee Details With ID
app.get("/users/:id", async (req, res) => {
  const employeeId = req.params.id; // Extract id from request parameters
  try {
    // Assuming users is your Mongoose model for users
    const foundEmployee = await users.findOne({ employee_id: employeeId }); // Querying user by employee_id

    if (!foundEmployee) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(foundEmployee); // Send user details as JSON response
  } catch (err) {
    console.error("Error fetching employee details:", err);
    res.status(500).json({ error: "Server error" });
  }
});





// Edit Employee Details
app.put("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Check if password is being updated
    if (updateData.employee_password) {
      const salt = await bcrypt.genSalt(10);
      updateData.employee_password = await bcrypt.hash(
        updateData.employee_password,
        salt
      );
    }

    const result = await users.updateOne(
      { employee_id: userId },
      { $set: updateData }
    );

    if (result.nModified === 0) {
      res.status(404).send("User not found or no changes made");
    } else {
      res.status(200).send("User updated successfully");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user");
  }
});





// Delete Employee
app.delete("/users/:id", async (req, res) => {
  const newuser = await users.deleteOne({ employee_id: req.params.id });
  res.status(200).send(newuser);
});






// View Assigned Projects (protected)
app.get("/assign", async (req, res) => {
  try {
    const assignments = await Assign.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "employee_id",
          foreignField: "employee_id",
          as: "employee",
        },
      },
      {
        $unwind: "$employee",
      },
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "project_id",
          as: "project",
        },
      },
      {
        $unwind: "$project",
      },
      {
        $project: {
          assign_id: "$_id",
          employee_id: "$employee.employee_id",
          employee_name: "$employee.employee_name",
          project_id: "$project._id",
          project_name: "$project.project_name",
          project_description: "$project.project_description",
        },
      },
    ]);
    res.json(assignments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching assigned projects", error });
  }
});






// Sum of Project, Employees, Timesheets
app.get("/totalprojects", async (req, res) => {
  try {
    const totalprojects = await project.countDocuments({});
    res.json({ totalprojects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/totalusers", async (req, res) => {
  try {
    const totalusers = await users.countDocuments({});
    res.json({ totalusers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/totaltimesheets", async (req, res) => {
  try {
    const totaltimesheets = await Timesheet.countDocuments({});
    res.json({ totaltimesheets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});






// Assign Project
app.post("/assign", async (req, res) => {
  try {
    const assignment = await Assign.create(req.body);
    res.status(201).json({ message: "Assignment successful", assignment });
  } catch (error) {
    console.error("Error assigning projects:", error);
    res
      .status(500)
      .json({ message: "Failed to assign projects", error: error.message });
  }
});





// Delete Assignment
app.delete("/assign/:id", async (req, res) => {
  const newuser = await Assign.deleteOne({ _id: req.params.id });
  res.status(200).send(newuser);
});





// Add Project
app.post("/project", async (req, res) => {
  const newuser = await project.create(req.body);
  res.status(201).send(newuser);
});




// View Projects
app.get("/project", async (req, res) => {
  const newuser = await project.find();
  res.send(newuser);
});



// View Project With ID
app.get("/project/:id", async (req, res) => {
  const projectId = req.params.id; // Extract id from request parameters
  try {
    // Assuming project is your Mongoose model for projects
    const foundProject = await project.findOne({ project_id: projectId }); // Querying project by id

    if (!foundProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(foundProject); // Send project details as JSON response
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({ error: "Server error" });
  }
});





// View Project which is pending to assign
app.get("/projects", async (req, res) => {
  try {
    // Fetch all projects
    const allProjects = await project.find();

    // Fetch assigned project IDs
    const assignedProjects = await Assign.find().distinct("project_id");

    // Map assigned project IDs to an array of strings for easier comparison
    const assignedProjectIds = assignedProjects.map(String);

    // Map all projects to include a status field indicating assigned or unassigned
    const projectsWithStatus = allProjects.map((project) => ({
      ...project.toObject(),
      status: assignedProjectIds.includes(String(project.project_id))
        ? "Assigned"
        : "Unassigned",
    }));

    res.json(projectsWithStatus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching projects" });
  }
});






// View Project by ID
app.get("/project/:id", async (req, res) => {
  try {
    const editproject = await project.findById(req.params.id);
    if (!editproject) {
      return res.status(404).send({ error: "Project not found" });
    }
    res.send(editproject);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});




// Edit Project
app.put("/project/:id", async (req, res) => {
  try {
    const result = await project.updateOne(
      { project_id: req.params.id },
      { $set: req.body }
    );

    if (result.matchedCount > 0) {
      const updatedProjectData = await project.findOne({
        project_id: req.params.id,
      });
      res.status(200).json(updatedProjectData);
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});





// Delete Project
app.delete("/project/:id", async (req, res) => {
  const newuser = await project.deleteOne({ project_id: req.params.id });
  res.status(200).send(newuser);
});




// vIew Timesheet by Id
app.get("/timesheets/:projectId", async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const timesheets = await Timesheet.find({ project_id: projectId });
    res.json(timesheets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching timesheets", error });
  }
});





// View TImesheet Data
app.get("/timesheet", async (req, res) => {
  try {
    const timesheets = await Timesheet.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "employee_id",
          foreignField: "employee_id",
          as: "employee",
        },
      },
      { $unwind: "$employee" },
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "project_id", // Assuming _id is the unique identifier for projects
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $project: {
          _id: "$project._id",
          employee_id: "$employee.employee_id",
          employee_name: "$employee.employee_name",
          project_id: "$project.project_id",
          project_name: "$project.project_name",
          project_description: "$project.project_description",
          dateTime: "$dateTime", // Ensure dateTime is correctly referenced
        },
      },
    ]);

    res.json(timesheets);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching assigned projects", error });
  }
});





// Delete Timesheet Data
app.delete("/timesheet", async (req, res) => {
  const newuser = await Timesheet.deleteOne(req.body);
  res.status(201).send(newuser);
});





// Add timesheet data by user
app.post("/timesheet", async (req, res) => {
  try {
    const assignment = await Timesheet.create(req.body);
    res.status(201).json({ message: "Assignment successful", assignment });
  } catch (error) {
    console.error("Error assigning projects:", error);
    res
      .status(500)
      .json({ message: "Failed to assign projects", error: error.message });
  }
});




// app.post('/timesheet', async (req, res) => {
//   try {
//     console.log('Request Body:', req.body); // Log request body

//     // Validate the incoming request data
//     const { error } = validateTimesheet(req.body);
//     if (error) {
//       console.error('Validation Error:', error.details[0].message); // Log validation error
//       return res.status(400).send({ error: error.details[0].message });
//     }

//     // Check if the timesheet entry already exists for the user and project
//     const existingTimesheet = await Timesheet.findOne({
//       employee_id: req.body.employee_id,
//       project_name: req.body.project_name,
//       dateTime: req.body.dateTime,
//     });

//     if (existingTimesheet) {
//       console.log('Timesheet entry already exists for this user and project.');
//       return res.status(409).send({ error: 'Timesheet entry already exists' });
//     }

//     // Create a new timesheet entry
//     const newTimesheet = await Timesheet.create({
//       employee_id: req.body.employee_id,
//       employee_name: req.body.employee_name,
//       project_name: req.body.project_name,
//       project_description: req.body.project_description,
//       dateTime: req.body.dateTime,
//     });

//     // Send success response
//     res.status(201).send(newTimesheet);
//   } catch (error) {
//     console.error('Server Error:', error); // Log server error
//     res.status(500).send({ error: 'Internal Server Error' });
//   }
// });

// // Hypothetical validation function using Joi
// const Joi = require('joi');

// function validateTimesheet(timesheet) {
//   const schema = Joi.object({
//     employee_id: Joi.string().required(),
//     employee_name: Joi.string().required(),
//     project_name: Joi.string().required(),
//     project_description: Joi.string().required(),
//     dateTime: Joi.date().iso().required(),
//   });

//   return schema.validate(timesheet);
// }

// module.exports = validateTimesheet;






mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("connected");
    app.listen(8080);
    console.log("Port is 8080");
  })
  .catch((err) => {
    console.log("There was an Error" + err);
  });
