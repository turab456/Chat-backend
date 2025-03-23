import { sequelize } from "../db/index.js"; // Adjust the path if needed
import Language from "../models/common_model/language.model.js";

const languages = [
  { name: "English", code: "EN" },
  { name: "Spanish", code: "ES" },
  { name: "French", code: "FR" },
  { name: "German", code: "DE" },
  { name: "Chinese", code: "ZH" },
  { name: "Japanese", code: "JA" },
  { name: "Hindi", code: "HI" },
  { name: "Arabic", code: "AR" },
  { name: "Portuguese", code: "PT" },
  { name: "Russian", code: "RU" },
];

export default async function seedLanguages() {
  try {
    // await sequelize.authenticate();
    // console.log("🔗 Connected to the database.");

    // await sequelize.sync(); // Ensure the table exists

    for (const lang of languages) {
      await Language.findOrCreate({
        where: { code: lang.code },
        defaults: {
          name: lang.name,
          is_active: true,
        },
      });

      console.log(`✅ Inserted: ${lang.name} (${lang.code})`);
    }

    console.log("🎉 Language seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding languages:", error.message);
  }
}

// Run the function
// seedLanguages();
