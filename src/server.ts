import express from "express";
import dotenv from "dotenv";
import measureRoutes from "./routes/measureRoutes";
import uploadRoutes from "./routes/uploadRoutes";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api", uploadRoutes);
app.use("/api/measures", measureRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
