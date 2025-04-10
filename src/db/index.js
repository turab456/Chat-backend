import { Sequelize } from "sequelize";
import { database, username, password, host, dialect } from "../constants.js";

const sequelize = new Sequelize(database, username, password, {
    host: host,
    dialect: "postgres", // Specify PostgreSQL dialect here
    logging: false, // Disable logging if not needed (optional)
    dialectOptions: {
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false, // Handle SSL if necessary
    },
  });
  
const connectSequelize = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Sequelize Connected!");
  } catch (error) {
    console.error(`❌ Sequelize Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// // Sync database (Only for development, disable in production)
const syncDatabase = async () => {
  if (process.env.NODE_ENV === "development") {
    try {
      await sequelize.sync({ alter: true });  // Use { force: true } to drop and recreate tables
      console.log("✅ Database synced (tables created if not exist).");
    } catch (error) {
      console.error(`❌ Database Sync Error: ${error.message}`);
    }
  } else {
    console.log("⚠️ Database sync skipped in production. Use migrations.");
  }
};
syncDatabase();
export { sequelize, connectSequelize };











// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";

// const connectDB = async () => {
//     try{
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//         console.log(`✅ MongoDB Connected !! DB HOST : ${connectionInstance.connection.host}`)
//     }catch(err){
//         console.log(`❌ MongoDB Connection error : ${err}`);
//         process.exit(1);
//     }
// }

// export default connectDB;