import PlansPackage from "../../models/plans_model/plans_package.model.js";
import SchoolOwner from "../../models/school_model/school_owner.model.js";

SchoolOwner.hasMany(PlansPackage, {
  foreignKey: "school_owner_id_fk",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

PlansPackage.belongsTo(SchoolOwner, {
  foreignKey: "school_owner_id_fk",
});
