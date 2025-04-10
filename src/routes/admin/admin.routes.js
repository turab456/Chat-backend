// import { Router } from "express";
// import PlanType from "../../models/plans_model/plan_type.model.js";
// import UserRole from "../../models/user_roles.model.js";
// const router = Router();

// const seedPlanTypes = async () => {
//   try {
//     const plans = ["super_admin", "school_owner", "admin","principal","teacher","student","finance_head","finance_person","library","guards","store","house_keeping","receptionist"];

//     for (const plan of plans) {
//       await UserRole.findOrCreate({
//         where: { name: plan },
//       });
//     }

//     console.log("✅ Plan types seeded successfully.");
//   } catch (error) {
//     console.error("❌ Error seeding plan types:", error);
//   }
// };


// const getAllPlanTypes = async (req, res) => {
//   try {
//     const plans = await PlanType.findAll();
//     res.status(200).json(plans);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "❌ Failed to fetch plans.", error: error.message });
//   }
// };

// router.get("/seed", async (req, res) => {
//   try {
//     await seedPlanTypes();
//     res.status(200).json({ message: "✅ Plan types added successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "❌ Internal Server Error", error: error.message });
//   }
// });

// // router.route("/register").post(
// //   upload.fields([
// //     {
// //       name: "avatar",
// //       maxCount: 1,
// //     },
// //     {
// //       name: "coverImage",
// //       maxCount: 1,
// //     },
// //   ]),
// //   registerUser
// // );

// router.route("/getallusers").get(getAllPlanTypes);

// export default router;
