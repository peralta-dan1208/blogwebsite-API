const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");

require('dotenv').config();

const app = express();

mongoose.connect(process.env.MONGODB_STRING);

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => console.log('Now connected to MongoDB Atlas'));

const corsOption = {
    origin: ["http://localhost:5173"],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(express.json());
app.use(cors(corsOption));

app.use("/users", userRoutes);
app.use("/posts", blogRoutes);

if (require.main === module) {
    app.listen(process.env.PORT || 3000, () =>
        console.log(`API is now online on port ${process.env.PORT || 3000}`)
    );
}

module.exports = { app, mongoose };