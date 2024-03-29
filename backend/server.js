const express = require('express');
const serverless = require("serverless-http");
const cors = require('cors');

// express app
const schedule = require('node-schedule');
const app = express();
const bodyParser = require("body-parser");
app.use(cors());
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const ordersRoutes = require('./routes/orders');
const formRoutes = require('./routes/form');
const userRoutes = require('./routes/user');
const { resetMonthlyUserData } = require('./utils/monthlyOrderReset');
const monthlyResetJob = schedule.scheduleJob('0 0 1 * *', resetMonthlyUserData);

// middleware - code that executes b/w us sending a req on the server and us sending a response
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer errors (e.g., file size exceeded)
        return res.status(400).json({ error: err.message });
    }
    // Handle other errors
    return res.status(500).json({ error: 'Internal Server Error' });
});


// middle ware. express.static(root, [options]). It lets us serve static files such as images, CSS files, etc.
app.use('/images', express.static('images'));
// routes
app.use('/api/orders', ordersRoutes);

app.use('/api/forms', formRoutes);

app.use('/api/user', userRoutes);


// connect to MongoDB(it's async)
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    
    // listen for requests
    app.listen(process.env.PORT, () => {
        console.log('Connected to db, listening to port ', process.env.PORT);
    });
})
.catch((error) => {
    console.log(error);
});

