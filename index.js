const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const users = require("./Models/employee.modals");
const project = require("./Models/addproject.modals");
const timesheet = require("./Models/timesheet.modals");
const userlogin = require("./Models/userlogin.modal");
const superadmin = require("./Models/superadmin.modals");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const authenticateToken = require('./authMiddleware'); 

const Assign = require("./Models/assign.modals");
const app = express();
const cors = require("cors");

const secretKey = 'your-secret-key'; // Use a more secure key in production

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000', // React frontend
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

const mongoURI = "mongodb+srv://amrinder022000:15121999Amrinder@loginandmanagementsyste.rhriyb5.mongodb.net/LoginAndManagementSystem?retryWrites=true&w=majority&appName=LoginAndManagementSystem";

const superadminUser = {
  email: "superadmin@test.com",
  password: "superadmin@test.com",
  token: "some-jwt-token",
};

// Middleware to verify JWT tokens
const authenticateTokens = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Super Admin Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log("Received login request with:", { email, password });

  if (email === superadminUser.email && password === superadminUser.password) {
    const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
    res.json({ token, data: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

// Employee Login
app.post("/userslogin", async (req, res) => {
  const { employee_email, employee_password } = req.body;
  console.log("Received user login request with:", { employee_email, employee_password });

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

    const isMatch = await bcrypt.compare(employee_password, user.employee_password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ email: employee_email }, secretKey, { expiresIn: '1h' });
    res.json({ token, data: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Middleware to check if user is authenticated
const checkAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

// Dashboard endpoint (protected)
  app.get('/dashboard', authenticateToken, async (req, res) => {
    try {
      const user = await users.findOne({ employee_email: req.user.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const assignments = await Assign.aggregate([
        { $match: { employee_id: user.employee_id } },
        {
          $lookup: {
            from: 'projects',
            localField: 'project_id',
            foreignField: 'project_id',
            as: 'project',
          },
        },
        { $unwind: '$project' },
        {
          $project: {
            assign_id: '$_id',
            project_id: '$project._id',
            project_name: '$project.project_name',
            project_description: '$project.project_description',
          },
        },
      ]);

      res.json({ name: user.employee_name, assignments });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching dashboard data', error });
    }
  });

// Add Employee
app.post("/users", async (req, res) => {
  const newuser = await users.create(req.body);
  res.status(201).send(newuser);
});

// View Employee
app.get("/users", async (req, res) => {
  const newuser = await users.find();
  res.send(newuser);
});

// Edit Employee Details
app.put("/users", async (req, res) => {
  const newuser = await users.updateOne(req.body);
  res.status(201).send(newuser);
});

// Delete Employee
app.delete("/users/:id", async (req, res) => {
  const newuser = await users.deleteOne({ employee_id: req.params.id });
  res.status(200).send(newuser);
});

// View Assigned Projects (protected)

app.get("/assign", async (req, res)=>{
  try {
    const assignments = await Assign.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'employee_id',
          foreignField: 'employee_id',
          as: 'employee',
        },
      },
      {
        $unwind: '$employee',
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'project_id',
          foreignField: 'project_id',
          as: 'project',
        },
      },
      {
        $unwind: '$project',
      },
      {
        $project: {
          assign_id: '$_id',
          employee_id: '$employee.employee_id',
          employee_name: '$employee.employee_name',
          project_id: '$project._id',
          project_name: '$project.project_name',
          project_description: '$project.project_description',
        },
      },
    ]);
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assigned projects', error });
  }
  });

  app.get("/assigns", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id; // Extract user ID from decoded JWT token
  
      // Query assignments for the logged-in user
      const assignments = await Assign.find({ employee_id: userId }).populate('project_id');
  
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

  // View Assigned Project
  app.get("/assigns", authenticateToken, async (req, res) => {
    try {
      const userId = req.user._id;
      const assignments = await Assign.aggregate([
        { $match: { employee_id: userId } }, // Match only the logged-in user's projects
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
            foreignField: "project_id",
            as: "project",
          },
        },
        { $unwind: "$project" },
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
      res.status(500).json({ message: "Error fetching assigned projects", error });
    }
  });
  
  


  

// Assign Project
app.post("/assign", async (req, res) => {
  try {
    const assignment = await Assign.create(req.body);
    res.status(201).json({ message: "Assignment successful", assignment });
  } catch (error) {
    console.error("Error assigning projects:", error);
    res.status(500).json({ message: "Failed to assign projects", error: error.message });
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
    const updatedProject = await project.updateOne(
      { project_id: req.params.id },
      { $set: req.body }
    );

    if (updatedProject.nModified > 0) {
      const updatedProjectData = await project.findOne({ project_id: req.params.id });
      res.status(200).json(updatedProjectData);
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Project
app.delete("/project/:id", async (req, res) => {
  const newuser = await project.deleteOne({ project_id: req.params.id });
  res.status(200).send(newuser);
});

// Timesheet
app.post("/timesheet", async (req, res) => {
  const newuser = await timesheet.create(req.body);
  res.status(201).send(newuser);
});
app.get("/timesheet", async (req, res) => {
  const newuser = await timesheet.find();
  res.send(newuser);
});
app.put("/timesheet", async (req, res) => {
  const newuser = await timesheet.updateOne(req.body);
  res.status(201).send(newuser);
});
app.delete("/timesheet", async (req, res) => {
  const newuser = await timesheet.deleteOne(req.body);
  res.status(201).send(newuser);
});

mongoose.connect(mongoURI)
  .then(() => {
    console.log("connected");
    app.listen(8080);
    console.log("Port is 8080");
  })
  .catch((err) => {
    console.log("There was an Error" + err);
  });
