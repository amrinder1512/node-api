const mongoose = require("mongoose");
const express = require("express");
const users = require("./Models/employee.modals");
const project = require("./Models/project.modals");
const timesheet = require("./Models/timesheet.modals");
const login = require("./Models/userlogin.modal")
const superadmin= require("./Models/superadmin.modals")
const app = express();
app.use(express.json());


const mongoURI =
  "mongodb+srv://amrinder022000:15121999Amrinder@loginandmanagementsyste.rhriyb5.mongodb.net/LoginAndManagementSystem?retryWrites=true&w=majority&appName=LoginAndManagementSystem";

app.post("/users", async (request, response) => {
  const newuser = await users.create(request.body);
  response.status(201).send(newuser);
});
app.get("/users", async (request, response) => {
  const newuser = await users.find();
  response.send(newuser);
});

app.put("/users", async (request, response) => {
  const newuser = await users.updateOne(request.body);
  response.status(201).send(newuser);
});
app.delete("/users", async (request, response) => {
  const newuser = await users.deleteOne(request.body);
  response.status(201).send(newuser);
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
app.delete("/project", async (request, response) => {
  const newuser = await project.deleteOne(request.body);
  response.status(201).send(newuser);
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



app.post("/login", async (request, response)=>{
  const loginuser = await login.create(request.body);
  response.status(201).send(loginuser);
});
app.get("/login", async (request, response)=>{
  const loginuser = await login.findOne(request.body).select("-password");
  response.status(200).send(loginuser);
});



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
