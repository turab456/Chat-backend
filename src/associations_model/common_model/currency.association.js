import Currency from "../../models/common_model/currency.model.js";
import SuperAdmin from "../../models/super_admin/super_admin.model.js";


const CurrencyAssociation = () => {
    // ✅ Currency has many SuperAdmins
    Currency.hasMany(SuperAdmin, {
      foreignKey: "currency_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  
    // ✅ SuperAdmin belongs to Currency
    SuperAdmin.belongsTo(Currency, {
      foreignKey: "currency_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

export default CurrencyAssociation;
