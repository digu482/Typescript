import express from "express";
const app = express();
require("./config/db")
require("dotenv").config();
const PORT = process.env.PORT || 2100;
import userRoutes from './route/user.route';
app.use(express.json());

app.use('/user', userRoutes);
app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
})

module.exports 