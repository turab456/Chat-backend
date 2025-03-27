import UserRole from "../models/user_roles.model.js";

const roles = [
  "Super_Admin",
  "School_Owner",
  "School_Incharge",
  "Principal",
  "School_Coordinator",
  "Teacher",
  "Student",
  "Finance_Head",
  "Finance_Person",
  "Library",
  "Guards",
  "Store",
  "House_Keeping",
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