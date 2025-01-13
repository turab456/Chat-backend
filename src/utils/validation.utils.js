export const validateEmail = (email) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
export const validateMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);
export const validatePassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/.test(
    password
  );
export const validateGstNo = (gstNo) => /^[A-Za-z0-9]{1,15}$/.test(gstNo);
export const validatePanNo = (panNo) =>
  /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNo);
export const validateBankDetails = (bankDetails) =>
  /^\d{5,20}(-\d{1,5})?$/.test(bankDetails);
export const validateUrl = (url) =>
  /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(url);
