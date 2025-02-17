import dotenv from "dotenv";
import {connectSequelize} from "./db/index.js";
import { app } from "./app.js";
import { PORT } from "./constants.js";
import syncDatabase from "./utils/dbSync.js";

dotenv.config({
  path: "./.env",
});

connectSequelize()
  .then(() => {
    app.on("error", (error) => {
      console.log(`Error : ${error}`);
      throw error;
    });

    syncDatabase();

    app.listen(PORT, () => {
      console.log(`🔥 server is running at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`❌ Postgressql DB connection failed ${err}`);
  });
