
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simulate a simple user database
let users = {};
let scheduledPickups = {};

// POST request for login/signup
app.post('/auth', (req, res) => {
  const { email, password, authOption } = req.body;

  if (!email || !password || !authOption) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (authOption === 'signup') {
    if (users[email]) {
      return res.status(400).json({ message: 'User already exists. Please log in.' });
    }
    users[email] = password;
    return res.status(200).json({ message: 'Sign-up successful! You can now log in.' });
  } else if (authOption === 'login') {
    if (!users[email] || users[email] !== password) {
      return res.status(401).json({ message: 'Invalid credentials. Please try again.' });
    }
    return res.status(200).json({ message: 'Login successful!' });
  } else {
    return res.status(400).json({ message: 'Invalid authentication option.' });
  }
});

// POST request for scheduling waste pickup
app.post('/schedule', (req, res) => {
  const { email, date, time, location } = req.body;

  if (!email || !date || !time || !location) {
    return res.status(400).json({ message: 'All fields are required for scheduling.' });
  }

  if (!users[email]) {
    return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
  }

  scheduledPickups[email] = { date, time, location };
  return res.status(200).json({
    message: `Pickup scheduled for ${date} at ${time} in ${location}.`,
  });
});

// DELETE request to cancel a scheduled pickup
app.delete('/schedule', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required to cancel a schedule.' });
  }

  if (!scheduledPickups[email]) {
    return res.status(404).json({ message: 'No scheduled pickup found to cancel.' });
  }

  delete scheduledPickups[email];
  return res.status(200).json({ message: 'Scheduled pickup ca
