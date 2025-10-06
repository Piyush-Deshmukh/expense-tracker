import express from "express";
import cors from "cors";
import { config } from "./config";
import { connectDB } from "./config/db";
import AppRoutes from "./routes";
import path from "path";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.static(path.resolve(__dirname, "../client/dist")));

app.use("/api", AppRoutes);

app.get("/health", (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "Server is running and healthy 🚀",
  });
});

app.get("*path", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"));
});

connectDB(config.mongoUri)
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} 🚀`);
    });
  })
  .catch((error) => {
    console.error("DB Connection Error: ", error);
  });
