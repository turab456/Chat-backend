import PlanType from "../../models/plans_model/plan_type.model.js";
import PlansPackage from "../../models/plans_model/plans_package.model.js";

// Define Associations Here
// PlanPackage belongs to SchoolOwner (Foreign key: school_owner_id_fk)
const PlanTypeAssociation = () => {
  PlanType.hasOne(PlansPackage, {
    foreignKey: "plan_type_id_fk",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  
  // SchoolOwner has many PlanPackages
  PlansPackage.belongsTo(PlanType, {
    foreignKey: "plan_type_id_fk",
  });
}

export default PlanTypeAssociation;
