import Language from "../../models/common_model/language.model.js";
import SuperAdmin from "../../models/super_admin/super_admin.model.js";

const LanguageAssociation = () => {
 // ✅ Language has many SuperAdmins
Language.hasMany(SuperAdmin, {
    foreignKey: 'language_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  
  // ✅ SuperAdmin belongs to Language
  SuperAdmin.belongsTo(Language, {
    foreignKey: 'language_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

};

export default LanguageAssociation;

