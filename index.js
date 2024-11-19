const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors'); // Import cors
const errorHandler = require('./middleware/errorHandler');
const connectDb = require('./config/dbConnection');

// Connect to the database
connectDb();

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors()); // Add CORS middleware here
app.use(cors({origin:'*'}));
// Middleware to parse JSON
app.use(express.json());

// User routes
app.use('/api/user', require('./routes/userRoutes'));

// Error handler middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Listening to PORT: ${PORT}`);
});
