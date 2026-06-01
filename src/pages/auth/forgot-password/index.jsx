import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { forgotPasswordApi, resetPasswordApi } from "../../../services/auth-api";

// ForgotPassword runs the email-code-new-password recovery flow.
export default function ForgotPassword() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [emailForReset, setEmailForReset] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState("request");

  const requestSchema = Yup.object({
    email: Yup.string().email(t("auth.invalidEmail")).required(t("auth.emailRequired")),
  });

  const resetSchema = Yup.object({
    otp: Yup.string().required(t("auth.otpRequired")),
    newPassword: Yup.string().min(6, t("auth.passwordMin6")).required(t("auth.passwordRequired")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], t("auth.passwordsMatch"))
      .required(t("auth.confirmRequired")),
  });

  const handleRequestReset = async (values, { setSubmitting }) => {
    setError("");
    setSuccess("");
    try {
      await forgotPasswordApi(values.email);
      setEmailForReset(values.email);
      setStep("reset");
      setSuccess(t("auth.resetCodeSent"));
    } catch (err) {
      setError(err?.message || t("auth.resetRequestFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (values, { setSubmitting }) => {
    setError("");
    setSuccess("");
    try {
      await resetPasswordApi({
        email: emailForReset,
        otp: values.otp,
        newPassword: values.newPassword,
      });
      setSuccess(t("auth.passwordResetSuccess"));
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(err?.message || t("auth.resetFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 ${isRTL ? "text-right" : "text-left"}`}
      style={{
        direction: isRTL ? "rtl" : "ltr",
        backgroundImage: "url('/images/60854d0f90c724d6a8d1ba05aa4e38b870012968.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md rounded-[24px] bg-white p-7 shadow-2xl">
        <h1 className="text-2xl font-black text-[#d4800b]">{t("auth.forgotPassword")}</h1>
        <p className="text-sm text-[#6b7280] mt-2">
          {step === "request" ? t("auth.resetRequestSubtitle") : t("auth.resetPasswordSubtitle", { email: emailForReset })}
        </p>

        {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
        {success && <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}

        {step === "request" ? (
          <Formik
            initialValues={{ email: "" }}
            validationSchema={requestSchema}
            onSubmit={handleRequestReset}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="mt-6 space-y-4">
                <div>
                  <Field
                    name="email"
                    type="email"
                    placeholder={t("auth.emailAddress")}
                    className={`w-full px-4 py-3 rounded-xl border outline-none ${errors.email && touched.email ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.email && touched.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#d4800b] text-white font-semibold disabled:opacity-60"
                >
                  {isSubmitting ? t("auth.submitting") : t("auth.sendResetCode")}
                </button>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{ otp: "", newPassword: "", confirmPassword: "" }}
            validationSchema={resetSchema}
            onSubmit={handleResetPassword}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="mt-6 space-y-4">
                <div>
                  <Field
                    name="otp"
                    type="text"
                    placeholder={t("auth.otpPlaceholder")}
                    className={`w-full px-4 py-3 rounded-xl border outline-none ${errors.otp && touched.otp ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.otp && touched.otp && <p className="mt-1 text-xs text-red-500">{errors.otp}</p>}
                </div>

                <div className="relative">
                  <Field
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.newPassword")}
                    className={`w-full px-4 py-3 rounded-xl border outline-none ${isRTL ? "pl-10" : "pr-10"} ${errors.newPassword && touched.newPassword ? "border-red-400" : "border-gray-300"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-3" : "right-3"} text-gray-500`}
                    aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.newPassword && touched.newPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <Field
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.confirmPassword")}
                    className={`w-full px-4 py-3 rounded-xl border outline-none ${errors.confirmPassword && touched.confirmPassword ? "border-red-400" : "border-gray-300"}`}
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#d4800b] text-white font-semibold disabled:opacity-60"
                >
                  {isSubmitting ? t("auth.submitting") : t("auth.resetPasswordAction")}
                </button>
              </Form>
            )}
          </Formik>
        )}

        <div className={`mt-6 text-sm ${isRTL ? "text-left" : "text-right"}`}>
          <Link to="/login" className="text-[#d4800b] font-semibold hover:underline">
            {t("auth.signIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
