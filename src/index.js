import { configDotenv } from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

configDotenv({
  path: "./.env",
});

const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Visit http://localhost:${PORT} to see the app in action`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to the database:", err);
    process.exit(1);
  });
