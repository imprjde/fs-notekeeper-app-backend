const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const noteRoutes = require("./routes/noteRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
dotenv.config();
connectDB();
app.use(express.json());

app.use("/api/users", userRoutes.router);

app.use("/api/notes", noteRoutes.router);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`);
});
