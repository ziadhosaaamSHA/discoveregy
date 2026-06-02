import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import { useAuth } from "../../../../context/AuthContext";
import { useLanguage } from "../../../../context/LanguageContext";
import { Button, ConfirmModal } from "../../../../components/ui";
import { useProfile } from "./hooks/useProfile";

// Profile manages account details, password changes, and destructive account actions.
export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const {
    error,
    isDeleteConfirmOpen,
    isDeleting,
    passwordMessage,
    passwordSchema,
    profileInitialValues,
    profileMessage,
    profileSchema,
    resolvedRole,
    changePassword,
    deleteAccount,
    setIsDeleteConfirmOpen,
    updateProfile,
  } = useProfile({ user, updateUser, logout, navigate, t });

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
            onSubmit={updateProfile}
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
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="md:col-span-2"
                >
                  {isSubmitting ? t("auth.submitting") : t("auth.saveChanges")}
                </Button>
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
            onSubmit={changePassword}
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
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="secondary"
                  className="md:col-span-3"
                >
                  {isSubmitting ? t("auth.submitting") : t("auth.changePasswordTitle")}
                </Button>
              </Form>
            )}
          </Formik>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-red-200">
          <h2 className="text-xl font-bold text-red-700 mb-2">{t("auth.deleteAccount")}</h2>
          <p className="text-sm text-gray-600 mb-4">{t("auth.deleteAccountHint")}</p>
          <Button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            disabled={isDeleting}
            variant="danger"
          >
            {isDeleting ? t("auth.submitting") : t("auth.deleteAccount")}
          </Button>
        </section>
      </div>
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title={t("auth.deleteAccount")}
        message={t("auth.deleteAccountConfirm")}
        confirmLabel={isDeleting ? t("auth.submitting") : t("auth.deleteAccount")}
        cancelLabel={t("common.cancel")}
        onConfirm={deleteAccount}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        isLoading={isDeleting}
        tone="danger"
      />
    </div>
  );
}
