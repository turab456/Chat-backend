import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { PORT } from "./constants.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(`Error : ${error}`);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`🔥 server is running at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`❌ MongoDB connection failed ${err}`);
  });
