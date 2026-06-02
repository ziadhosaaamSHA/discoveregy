// Backward-compatible auth export surface used by AuthContext and auth pages.
// New implementation work should happen in src/services/api/auth.api.js,
// src/services/api/profile.api.js, or src/services/api/public-nationalities.api.js.
export {
  forgotPasswordApi,
  loginApi,
  logoutApi,
  registerApi,
  resetPasswordApi,
  socialLoginApi,
} from "./api/auth.api";
export {
  fetchNationalities,
  fetchNationalityById,
  resolveNationalityId,
} from "./api/public-nationalities.api";
export {
  changePasswordApi,
  deleteMyAccountApi,
  fetchMyProfile,
  updateMyProfileApi,
} from "./api/profile.api";
