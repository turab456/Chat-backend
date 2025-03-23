import UserRole from "../models/user_roles.model.js";

const roles = [
  "Super Admin",
  "School Owner",
  "School Incharge",
  "Principal",
  "School Coordinator",
  "Teacher",
  "Student",
  "Finance Head",
  "Finance Person",
  "Library",
  "Guards",
  "Store",
  "House Keeping",
  "Receptionist",
];

const insertUserRoles = async () => {
  try {
    for (const role of roles) {
      await UserRole.findOrCreate({
        where: { name: role },
        defaults: { name: role }, // Ensures new roles are inserted only if they don't exist
      });
    }
    console.log("✅ User roles inserted successfully.");
  } catch (error) {
    console.error("❌ Error inserting user roles:", error);
  }
};

export default insertUserRoles;