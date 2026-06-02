import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../../context/AuthContext";
import { useLanguage } from "../../../../context/LanguageContext";
import { changePasswordApi, deleteMyAccountApi, updateMyProfileApi } from "../../../../services/auth-api";
import { tourismApi } from "../../../../services/tourism-api";
import { ConfirmModal } from "../../../../components/ui";

// Profile manages account details, password changes, and destructive account actions.
export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [resolvedRole, setResolvedRole] = useState("");
  const [profileInitialValues, setProfileInitialValues] = useState({
    userName: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const profileSchema = Yup.object({
    userName: Yup.string().min(2, t("validation.nameMin2")).required(t("auth.nameRequired")),
    phoneNumber: Yup.string().matches(/^[0-9]{10,15}$/, t("validation.phoneInvalid")).required(t("auth.phoneRequired")),
  });

  const passwordSchema = Yup.object({
    currentPassword: Yup.string().required(t("auth.passwordRequired")),
    newPassword: Yup.string().min(6, t("auth.passwordMin6")).required(t("auth.passwordRequired")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], t("auth.passwordsMatch"))
      .required(t("auth.confirmRequired")),
  });

  useEffect(() => {
    let cancelled = false;

    const loadUserDetails = async () => {
      const userId = Number(user?.id);
      if (!Number.isFinite(userId)) return;
      try {
        const [response, roleResponse] = await Promise.all([
          tourismApi.getUserById(userId),
          tourismApi.getUserRoles(userId).catch(() => []),
        ]);
        const payload =
          response && typeof response === "object"
            ? (response.data && typeof response.data === "object" ? response.data : response)
            : null;
        if (!payload || cancelled) return;
        const resolvedName =
          payload.userName ||
          payload.name ||
          `${payload.firstName || ""} ${payload.lastName || ""}`.trim() ||
          user?.name ||
          "";
        const resolvedPhone = payload.phoneNumber || payload.phone || user?.phoneNumber || "";
        setProfileInitialValues({
          userName: resolvedName,
          phoneNumber: resolvedPhone,
        });
        const roles = Array.isArray(roleResponse)
          ? roleResponse
          : Array.isArray(roleResponse?.items)
            ? roleResponse.items
            : Array.isArray(roleResponse?.data)
              ? roleResponse.data
              : [];
        const normalizedRoles = roles
          .map((role) => String(role?.name || role || "").trim().toLowerCase())
          .filter(Boolean);
        const nextType = normalizedRoles.includes("guide")
          ? "guide"
          : normalizedRoles.includes("admin")
            ? "admin"
          : normalizedRoles.includes("tourist")
            ? "tourist"
            : user?.type;
        if (nextType && nextType !== user?.type) {
          updateUser({ ...user, type: nextType });
        }
        if (normalizedRoles.length > 0) {
          const titleRole = normalizedRoles[0][0].toUpperCase() + normalizedRoles[0].slice(1);
          setResolvedRole(titleRole);
        } else {
          setResolvedRole("");
        }
      } catch {
        if (!cancelled) {
          setProfileInitialValues({
            userName: user?.name || "",
            phoneNumber: user?.phoneNumber || "",
          });
          setResolvedRole("");
        }
      }
    };

    loadUserDetails();
    return () => {
      cancelled = true;
    };
  }, [updateUser, user]);

  const handleUpdateProfile = async (values, { setSubmitting }) => {
    setError("");
    setProfileMessage("");
    try {
      await updateMyProfileApi(values);
      const nextUser = { ...user, name: values.userName };
      updateUser(nextUser);
      setProfileMessage(t("auth.profileUpdated"));
    } catch (err) {
      setError(err?.message || t("auth.profileUpdateFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (values, { setSubmitting, resetForm }) => {
    setError("");
    setPasswordMessage("");
    try {
      await changePasswordApi({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setPasswordMessage(t("auth.passwordChanged"));
      resetForm();
    } catch (err) {
      setError(err?.message || t("auth.passwordChangeFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setError("");
    try {
      await deleteMyAccountApi();
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err?.message || t("auth.deleteAccountFailed"));
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2E0CA] pt-28 pb-10 px-5" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-[#154d7d]">{t("auth.profileSettings")}</h1>
          <Link to={user?.type === 'admin' ? '/admin' : user?.type === 'guide' ? '/guide/home' : '/tourist/home'} className="text-[#d4800b] font-semibold hover:underline">
            {t("destination.goBackHome")}
          </Link>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#154d7d] mb-4">{t("auth.updateProfile")}</h2>
          {resolvedRole && (
            <p className="mb-3 text-sm font-semibold text-[#154d7d]">{`Role: ${resolvedRole}`}</p>
          )}
          {profileMessage && <p className="mb-4 text-sm text-green-700">{profileMessage}</p>}
          <Formik
            initialValues={profileInitialValues}
            validationSchema={profileSchema}
            onSubmit={handleUpdateProfile}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Field
                    name="userName"
                    placeholder={t("auth.firstNamePlaceholder")}
                    className={`w-full px-4 py-3 rounded-xl border outline-none ${errors.userName && touched.userName ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.userName && touched.userName && <p className="mt-1 text-xs text-red-500">{errors.userName}</p>}
                </div>
                <div>
                  <Field
                    name="phoneNumber"
                    placeholder={t("auth.phonePlaceholder")}
                    className={`w-full px-4 py-3 rounded-xl border outline-none ${errors.phoneNumber && touched.phoneNumber ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.phoneNumber && touched.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="md:col-span-2 py-3 rounded-xl bg-[#d4800b] text-white font-semibold disabled:opacity-60"
                >
                  {isSubmitting ? t("auth.submitting") : t("auth.saveChanges")}
                </button>
              </Form>
            )}
          </Formik>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#154d7d] mb-4">{t("auth.changePasswordTitle")}</h2>
          {passwordMessage && <p className="mb-4 text-sm text-green-700">{passwordMessage}</p>}
          <Formik
            initialValues={{ currentPassword: "", newPassword: "", confirmPassword: "" }}
            validationSchema={passwordSchema}
            onSubmit={handleChangePassword}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Field
                    name="currentPassword"
                    type="password"
                    placeholder={t("auth.password")}
                    className={`w-full px-4 py-3 rounded-xl border outline-none ${errors.currentPassword && touched.currentPassword ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.currentPassword && touched.currentPassword && <p className="mt-1 text-xs text-red-500">{errors.currentPassword}</p>}
                </div>
                <div>
                  <Field
                    name="newPassword"
                    type="password"
                    placeholder={t("auth.newPassword")}
                    className={`w-full px-4 py-3 rounded-xl border outline-none ${errors.newPassword && touched.newPassword ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.newPassword && touched.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>}
                </div>
                <div>
                  <Field
                    name="confirmPassword"
                    type="password"
                    placeholder={t("auth.confirmPassword")}
                    className={`w-full px-4 py-3 rounded-xl border outline-none ${errors.confirmPassword && touched.confirmPassword ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.confirmPassword && touched.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="md:col-span-3 py-3 rounded-xl bg-[#154d7d] text-white font-semibold disabled:opacity-60"
                >
                  {isSubmitting ? t("auth.submitting") : t("auth.changePasswordTitle")}
                </button>
              </Form>
            )}
          </Formik>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-red-200">
          <h2 className="text-xl font-bold text-red-700 mb-2">{t("auth.deleteAccount")}</h2>
          <p className="text-sm text-gray-600 mb-4">{t("auth.deleteAccountHint")}</p>
          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            disabled={isDeleting}
            className="py-3 px-6 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? t("auth.submitting") : t("auth.deleteAccount")}
          </button>
        </section>
      </div>
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title={t("auth.deleteAccount")}
        message={t("auth.deleteAccountConfirm")}
        confirmLabel={isDeleting ? t("auth.submitting") : t("auth.deleteAccount")}
        cancelLabel={t("common.cancel")}
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        isLoading={isDeleting}
        tone="danger"
      />
    </div>
  );
}
