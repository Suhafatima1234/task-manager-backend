// =====================
// Load environment variables
// =====================
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =====================
// Create app
// =====================
const app = express();
app.use(express.json());
app.use(express.static("public"));

// =====================
// MongoDB Schemas & Models
// =====================

// User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model("User", userSchema);

// Task schema (USER-SPECIFIC)
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  done: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

const Task = mongoose.model("Task", taskSchema);

// =====================
// Auth Middleware
// =====================
const auth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).send("No token provided");
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey"
    );
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).send("Invalid token");
  }
};

// =====================
// Routes
// =====================

// Root
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ---------- AUTH ROUTES ----------

// Signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hashedPassword
  });

  await user.save();
  res.send("User registered successfully");
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send("Invalid email or password");
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || "secretkey",
    { expiresIn: "1h" }
  );

  res.json({ token });
});

// ---------- TASK ROUTES (PROTECTED) ----------

// Get tasks (ONLY logged-in user's tasks)
app.get("/tasks", auth, async (req, res) => {
  const tasks = await Task.find({ userId: req.userId });
  res.json(tasks);
});

// Create task
app.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    title: req.body.title,
    done: req.body.done || false,
    userId: req.userId
  });

  await task.save();
  res.send("Task saved to DB");
});

// Update task (only own task)
app.put("/tasks/:id", auth, async (req, res) => {
  const updatedTask = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );

  if (!updatedTask) {
    return res.status(404).send("Task not found");
  }

  res.json(updatedTask);
});

// Delete task (only own task)
app.delete("/tasks/:id", auth, async (req, res) => {
  await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId
  });

  res.send("Task deleted");
});

// =====================
// Database Connection
// =====================
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URL.trim())
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });
