const mongoose = require("mongoose");
const express = require("express");
const users = require("./Models/employee.modals");
const project = require("./Models/addproject.modals");
const timesheet = require("./Models/timesheet.modals");
const userlogin = require("./Models/userlogin.modal");
const superadmin = require("./Models/superadmin.modals");
const bcrypt = require("bcrypt");

const Assign = require("./Models/assign.modals");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const mongoURI =
  "mongodb+srv://amrinder022000:15121999Amrinder@loginandmanagementsyste.rhriyb5.mongodb.net/LoginAndManagementSystem?retryWrites=true&w=majority&appName=LoginAndManagementSystem";

const superadminUser = {
  email: "superadmin@test.com",
  password: "superadmin@test.com",
  token: "some-jwt-token",
};



//Super Admin Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log("Received login request with:", { email, password });

  if (email === superadminUser.email && password === superadminUser.password) {
    res.json({ token: superadminUser.token, data: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});



// Add Employee
app.post("/users", async (request, response) => {
  const newuser = await users.create(request.body);
  response.status(201).send(newuser);
});




// Employee Login
app.post("/userslogin", async (request, response) => {
  const { employee_email, employee_password } = request.body;
  console.log("recieved userlogn request with :", {
    employee_email,
    employee_password,
  });

  if (!employee_email || !employee_password) {
    return response
      .status(400)
      .json({ message: "Email and password are required" });
  }

  try {
    const user = await users.findOne({ employee_email });
    if (!user) {
      console.log("User not found with email:", employee_email);
      return response
        .status(401)
        .json({ message: "Invalid email or password" });
    }

    console.log("User found:", user);

    if (!user.employee_password) {
      console.log("User password is missing in database");
      return response.status(500).json({ message: "Internal server error" });
    }

    const isMatch = await bcrypt.compare(
      employee_password,
      user.employee_password
    );
    if (!isMatch) {
      return response
        .status(401)
        .json({ message: "Invalid email or password" });
    }

    response.json({ data: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    response.status(500).json({ message: "Internal server error" });
  }
});



//View Employee
app.get("/users", async (request, response) => {
  const newuser = await users.find();
  response.send(newuser);
});



//Edit Employee Details
app.put("/users", async (request, response) => {
  const newuser = await users.updateOne(request.body);
  response.status(201).send(newuser);
});



//Delete Emplopyee
app.delete("/users/:id", async (request, response) => {
  const newuser = await users.deleteOne({ employee_id: request.params.id });
  response.status(200).send(newuser);
});



//View Assigned Project
async function getAssignmentDetails(assignmentId) {
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    console.log('Invalid assignment ID');
    return null;
  }

  try {
    const assignment = await Assign.findById(assignmentId)
      .populate({
        path: '_id',
        select: 'employee_name', // Selecting only the name field from the User schema
      })
      .populate({
        path: '_id',
        select: 'project_name project_description', // Selecting name and description fields from the Project schema
      });

    if (!assignment) {
      console.log('Assignment not found');
      return null;
    }

    console.log(assignment);
    return assignment;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Usage example:
const validAssignmentId = '60d5ec49f9e1e80ef8c5ab12'; // Replace this with your actual valid ObjectId
getAssignmentDetails(validAssignmentId)
  .then((assignment) => {
    if (assignment) {
      console.log('Employee Name:', assignment.employee_id.name);
      assignment.project_id.forEach((project) => {
        console.log('Project Name:', project.name);
        console.log('Project Description:', project.description);
      });
    }
  })
  .catch((err) => {
    console.error('Error fetching assignment details:', err);
  });


// Assign Project Request
app.post("/assign", async (req, res) => {
  const { employee_id, project_id } = req.body;

  try {
    const assignment = await assign.create({
      employee_id: req.body.employee_id,
      project_id: req.body.project_id,
    });

    res.status(201).json({ message: "Assignments successful", assignment });
  } catch (error) {
    console.error("Error assigning projects:", error);
    res
      .status(500)
      .json({ message: "Failed to assign projects", error: error.message });
  }
});



//Add Project 
app.post("/project", async (request, response) => {
  const newuser = await project.create(request.body);
  response.status(201).send(newuser);
});

//View Project
app.get("/project", async (request, response) => {
  const newuser = await project.find();
  response.send(newuser);
});


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

app.put("/project/:id", async (request, response) => {
  // Assuming 'project' is your Mongoose model for projects
  try {
    const updatedProject = await project.updateOne(
      { project_id: request.params.id },
      { $set: request.body } // Use request.body to update with incoming data
    );

    // Check if the project was found and updated successfully
    if (updatedProject.nModified > 0) {
      // If using updateOne, you may want to fetch the updated project
      const updatedProjectData = await project.findOne({
        project_id: request.params.id,
      });

      response.status(200).json(updatedProjectData); // Respond with updated project data
    } else {
      response.status(404).json({ message: "Project not found" });
    }
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});



//Delete Project
app.delete("/project/:id", async (request, response) => {
  const newuser = await project.deleteOne({ project_id: request.params.id });
  response.status(200).send(newuser);
});






// Timesheet
app.post("/timesheet", async (request, response) => {
  const newuser = await timesheet.create(request.body);
  response.status(201).send(newuser);
});
app.get("/timesheet", async (request, response) => {
  const newuser = await timesheet.find();
  response.send(newuser);
});

app.put("/timesheet", async (request, response) => {
  const newuser = await timesheet.updateOne(request.body);
  response.status(201).send(newuser);
});
app.delete("/timesheet", async (request, response) => {
  const newuser = await timesheet.deleteOne(request.body);
  response.status(201).send(newuser);
});














mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("connected");
    app.listen(8080);
  })
  .catch((err) => {
    console.log("There was an Error" + err);
  });
