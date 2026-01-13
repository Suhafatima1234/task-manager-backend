require("dotenv").config();
const mongoose = require("mongoose");


mongoose.connect(process.env.MONGO_URL.trim())


.then(()=>console.log("MongoDB connected"))
.catch(err => console.log(err));

const taskSchema = new mongoose.Schema({
  title: String,
  done: Boolean
});

const Task = mongoose.model("Task", taskSchema);



const express = require("express");
const app = express();

app.use(express.json());

let tasks = [];

app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});


app.post("/tasks", async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.send("Task saved to DB");
});

app.delete("/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.send("Task deleted");
});

app.put("/tasks/:id", async (req, res) => {
  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updatedTask);
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

