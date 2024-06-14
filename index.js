const mongoose = require("mongoose");
const express = require("express");
const users = require("./Models/employee.modals");
const project = require("./Models/addproject.modals");
const timesheet = require("./Models/timesheet.modals");
const userlogin = require("./Models/userlogin.modal")
const superadmin= require("./Models/superadmin.modals")
const bcrypt = require('bcrypt');

const assign = require("./Models/assign.modals")
const app = express();
const cors = require('cors');



app.use(cors());
app.use(express.json());


const mongoURI =
  "mongodb+srv://amrinder022000:15121999Amrinder@loginandmanagementsyste.rhriyb5.mongodb.net/LoginAndManagementSystem?retryWrites=true&w=majority&appName=LoginAndManagementSystem";

const superadminUser = {
  email: 'superadmin@test.com',
  password: 'superadmin@test.com',
  token: 'some-jwt-token',
};


  app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Received login request with:', { email, password });
  
    if (email === superadminUser.email && password === superadminUser.password) {
      res.json({ token: superadminUser.token, data: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  });










  app.post("/users", async (request, response) => {
    const newuser = await users.create(request.body);
    response.status(201).send(newuser);
  });












app.post('/userslogin', async (request, response)=>{
const {employee_email , employee_password } = request.body;
console.log ('recieved userlogn request with :',{employee_email , employee_password})

if (!employee_email || !employee_password) {
  return response.status(400).json({ message: 'Email and password are required' });
}

try {
  const user = await users.findOne({ employee_email });
  if (!user) {
      console.log('User not found with email:', employee_email);
      return response.status(401).json({ message: 'Invalid email or password' });
  }

  console.log('User found:', user);

  // Check if user document has the password field
  if (!user.employee_password) {
      console.log('User password is missing in database');
      return response.status(500).json({ message: 'Internal server error' });
  }

  const isMatch = await bcrypt.compare(employee_password, user.employee_password);
  if (!isMatch) {
      return response.status(401).json({ message: 'Invalid email or password' });
  }

  response.json({ data: 'Login successful' });
} catch (error) {
  console.error('Error during login:', error);
  response.status(500).json({ message: 'Internal server error' });
}

});















app.get("/users", async (request, response) => {
  const newuser = await users.find();
  response.send(newuser);
});












app.put("/users", async (request, response) => {
  const newuser = await users.updateOne(request.body);
  response.status(201).send(newuser);
});






app.delete("/users/:id", async (request, response) => {
  const newuser = await users.deleteOne({"employee_id": request.params.id});
  response.status(200).send(newuser);
});









app.get("/assign", async (req, res) => {
  try {
    const assignments = await assign.aggregate([
      {
        $lookup: {
          from: 'users', // Ensure this matches the actual collection name in MongoDB
          localField: 'employee_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $lookup: {
          from: 'projects', // Ensure this matches the actual collection name in MongoDB
          localField: 'project_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $unwind: '$project'
      }
    ]);

    res.send(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Failed to fetch assignments', error: error.message });
  }
});





// app.get("/assign", async (request, response) => {
//   const newuser = await assign.find();
//   response.send(newuser);
// });

app.post('/assign', async (req, res) => {
  const { employee_id, project_id } = req.body;

  try {
    const assignment = await assign.create({
      employee_id: req.body.employee_id,
      project_id: req.body.project_id,
    });
  
    res.status(201).json({ message: 'Assignments successful', assignment });
  } catch (error) {
    console.error('Error assigning projects:', error);
    res.status(500).json({ message: 'Failed to assign projects', error: error.message });
  }
  
  
});




app.post("/project", async (request, response) => {
  const newuser = await project.create(request.body);
  response.status(201).send(newuser);
});
app.get("/project", async (request, response) => {
  const newuser = await project.find();
  response.send(newuser);
});

app.put("/project", async (request, response) => {
  const newuser = await project.updateOne(request.body);
  response.status(201).send(newuser);
});
app.delete("/project/:id", async (request, response) => {
  const newuser = await project.deleteOne({"project_id":request.params.id});
  response.status(200).send(newuser);
});




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



// app.post("/login", async (request, response)=>{
//   const loginuser = await login.create(request.body);
//   response.status(201).send(loginuser);
// });
// app.get("/login", async (request, response)=>{
//   const loginuser = await login.findOne(request.body).select("-password");
//   response.status(200).send(loginuser);
// });



app.post("/superadmin", async (request, response) => {
  const newuser = await superadmin.create(request.body);
  response.status(201).send(newuser);
});
app.get("/superadmin", async (request, response) => {
  const newuser = await superadmin.find().select("-password");
  response.send(newuser);
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
