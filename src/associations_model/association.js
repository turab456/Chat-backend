import LanguageAssociation from "./common_model/language.association.js";
import "../models/school_model/school_owner.model.js";
import "../models/super_admin/super_admin.model.js";
import "../associations_model/plans_model/plans.associations.js";
import "../models/user_roles.model.js";
import "../associations_model/school_model/school_owner.associations.js";
import "../models/common_model/users.model.js";
import "../models/common_model/currency.model.js";
import "../models/common_model/language.model.js";
import { SuperAdminAssociation } from "./super_admin/super_admin.association.js";
import CurrencyAssociation from "./common_model/currency.association.js";
import "../models/common_model/user_session.model.js";
import userAssociations from "./common_model/users.association.js";
import updateCurrencies from "../utils/updateCurrency.utils.js";
import seedLanguages from "../scripts/seedLanguages.js";
import PlanTypeAssociation from "../associations_model/plans_model/plans.associations.js";
import SchoolOwnerAssociation from "../associations_model/school_model/school_owner.associations.js";
import OTPAssociation from "./common_model/otp.association.js";
import { verifyEmailAssociation } from "./common_model/verify_email.association.js";
import insertUserRoles from "../scripts/userRoles.scripts.js";

const Association = () => {
  PlanTypeAssociation();
  userAssociations();
  SchoolOwnerAssociation();
  SuperAdminAssociation();
  OTPAssociation()
  verifyEmailAssociation();
  // LanguageAssociation();
  // CurrencyAssociation();
  insertUserRoles();
  // always put these two at the last only
  // updateCurrencies();
  // seedLanguages();
};

export default Association;
