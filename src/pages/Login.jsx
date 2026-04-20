import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

// Figma assets
const imgBackground    = "http://localhost:3845/assets/60854d0f90c724d6a8d1ba05aa4e38b870012968.png";
const imgSmartphone    = "http://localhost:3845/assets/c8c5dd0d1c7608aaca2f024c896b513ec2017668.png";
const imgTraveller     = "http://localhost:3845/assets/c8dfa6312c2d8ae9f9373b8ebeb680371e67d3a1.png";
const imgBackIcon      = "http://localhost:3845/assets/6235413aa7ab9a66ee4722fb5888215567271838.svg";
const imgDeviconGoogle = "http://localhost:3845/assets/999bcb7d25735ca4686374c0705b5e744ead0ba8.svg";
const imgInstagram     = "http://localhost:3845/assets/87e560a6cf646bc9e704bfcb99191e4086b80c9d.svg";
const imgFacebook      = "http://localhost:3845/assets/3a5b2589104f8c803aa1fc6cf148dada39e075d8.svg";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email(t("auth.invalidEmail")).required(t("auth.emailRequired")),
    password: Yup.string().min(6, t("auth.passwordMin6")).required(t("auth.passwordRequired")),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    setError("");
    const result = login(values.email, values.password);
    if (result.success) {
      navigate("/home");
    } else {
      setError(t("auth.loginError"));
    }
    setSubmitting(false);
  };

  return (
    /* Full-page background image */
    <div
      className={`min-h-screen flex items-center justify-center p-6 relative ${isRTL ? "text-right" : "text-left"}`}
      style={{
        backgroundImage: `url(${imgBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Back button */}
      <Link
        to="/"
        className="absolute top-8 left-8 z-20 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
        aria-label={t("common.close")}
      >
        <img src={imgBackIcon} alt="back" className="w-full h-full" />
      </Link>

      {/* Large beige rounded card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative w-full max-w-5xl rounded-[50px] overflow-hidden shadow-[0px_4px_4px_3px_rgba(0,0,0,0.25)] ${isRTL ? "text-right" : "text-left"}`}
        style={{ backgroundColor: "#f2e0ca" }}
      >
        {/* Card heading */}
        <div className="flex flex-col items-center pt-8 pb-0 px-8">
          <h1
            className="font-extrabold text-3xl"
            style={{ color: "#d4800b", fontFamily: "Inter, sans-serif" }}
          >
            Log In Now
          </h1>
          <p className="text-lg font-medium mt-1" style={{ color: "#837e77" }}>
            {t("auth.loginSubtitle")}
          </p>
        </div>

        {/* Two-column row */}
        <div className={`flex gap-8 px-16 pb-12 pt-6 items-center justify-center ${isRTL ? "flex-row-reverse" : "flex-row"}`}>

          {/* ── Form card ── */}
          <div className="flex-shrink-0 w-full max-w-md">
            <div
              className="bg-white overflow-hidden p-8"
              style={{
                borderRadius: "20px",
                boxShadow: "2px 4px 4px 0px rgba(0,0,0,0.25)",
              }}
            >
              <h2
                className="text-center font-extrabold mb-2"
                style={{ color: "#d4800b", fontSize: "25px", fontFamily: "Inter, sans-serif" }}
              >
                {t("auth.loginTitle")}
              </h2>

              <p className="text-center text-sm mb-8" style={{ color: "#aea9a9" }}>
                {t("auth.loginSubtitle")}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={LoginSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="space-y-4">

                    {/* Email — Figma: #f7f7f9, rounded-[14px], shadow */}
                    <div>
                      <Field
                        name="email"
                        type="email"
                        placeholder={t("auth.emailAddress")}
                        className={`w-full px-4 py-3 outline-none transition-colors ${isRTL ? "text-right" : "text-left"}`}
                        style={{
                          backgroundColor: errors.email && touched.email ? "#fff0f0" : "#f7f7f9",
                          borderRadius: "14px",
                          boxShadow: errors.email && touched.email
                            ? "0 0 0 1.5px #f87171"
                            : "0px 4px 4px 0px rgba(0,0,0,0.25)",
                          border: "none",
                          color: "#333",
                          fontSize: "16px",
                        }}
                      />
                      {errors.email && touched.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    {/* Password — Figma: border, rounded-[14px] */}
                    <div className="relative">
                      <Field
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth.password")}
                        className={`w-full px-4 py-3 outline-none transition-colors ${isRTL ? "text-right pl-12" : "text-left pr-12"}`}
                        style={{
                          borderRadius: "14px",
                          border: errors.password && touched.password
                            ? "1.5px solid #f87171"
                            : "1px solid #e0e0e0",
                          color: "#333",
                          fontSize: "16px",
                          backgroundColor: "#fff",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 transition-colors`}
                        style={{ color: "#aea9a9" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#d4800b"}
                        onMouseLeave={e => e.currentTarget.style.color = "#aea9a9"}
                        aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      {errors.password && touched.password && (
                        <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                      )}
                    </div>

                    {/* Forgot password */}
                    <div className={isRTL ? "text-left" : "text-right"}>
                      <Link
                        to="/forgot-password"
                        className="text-sm font-semibold hover:underline"
                        style={{ color: "#d4800b" }}
                      >
                        {t("auth.forgotPassword")}
                      </Link>
                    </div>

                    {/* Login button — Figma: #d4800b, rounded-[14px], shadow */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 text-white font-semibold transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: "#d4800b",
                        borderRadius: "14px",
                        boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.25)",
                        fontSize: "16px",
                      }}
                      onMouseEnter={e => !isSubmitting && (e.currentTarget.style.backgroundColor = "#bc710a")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#d4800b")}
                    >
                      {isSubmitting ? t("auth.loginLoading") : t("auth.loginButton")}
                    </button>
                  </Form>
                )}
              </Formik>

              {/* Sign up */}
              <p className="mt-6 text-center text-sm" style={{ color: "#707b81" }}>
                {t("auth.noAccount")}{" "}
                <Link
                  to="/signup"
                  className="font-medium hover:underline"
                  style={{ color: "#d4800b" }}
                >
                  {t("auth.signUp")}
                </Link>
              </p>

              {/* Or + socials */}
              <div className="mt-6">
                <p className="text-center text-sm mb-4" style={{ color: "#80888a" }}>
                  {t("auth.orConnect")}
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ backgroundColor: "#e0e0e0" }} />
                  <span className="text-sm font-semibold" style={{ color: "#80888a" }}>Or</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: "#e0e0e0" }} />
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
                    style={{ border: "1px solid #e5e7eb" }}
                    aria-label={t("auth.facebook")}
                  >
                    <img src={imgFacebook} alt="Facebook" className="w-6 h-6 object-contain" />
                  </button>
                  <button
                    type="button"
                    className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
                    style={{ border: "1px solid #e5e7eb" }}
                    aria-label={t("auth.google")}
                  >
                    <img src={imgDeviconGoogle} alt="Google" className="w-6 h-6 object-contain" />
                  </button>
                  <button
                    type="button"
                    className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
                    style={{ border: "1px solid #e5e7eb" }}
                    aria-label={t("auth.instagram")}
                  >
                    <img src={imgInstagram} alt="Instagram" className="w-6 h-6 object-contain" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/*
           * ── Right side: smartphone + traveller images ──
           * hidden on mobile (hidden), visible on lg+ (lg:flex)
           * Exact Figma transforms applied:
           *   Smartphone wrapper: rotate-[-16.15deg] skew-x-[0.14deg]
           *   Smartphone image:   opacity-60, left-[-12.05%] top-[-10%] size-[120%]
           *   Traveller:          absolute, bottom-0 right-0, z-10 on top of smartphone
           */}
          <div className="hidden lg:flex flex-1 relative items-end justify-center" style={{ minHeight: "420px" }}>

            {/* Smartphone — rotated & skewed exactly as Figma */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ top: "-20px" }}
            >
              <div
                style={{
                  transform: "rotate(-16.15deg) skewX(0.14deg)",
                  width: "100%",
                  height: "100%",
                  position: "relative",
                }}
              >
                {/* Figma: image is 120% size, offset left-[-12.05%] top-[-10%], opacity 60% */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                    pointerEvents: "none",
                  }}
                >
                  <img
                    alt=""
                    src={imgSmartphone}
                    style={{
                      position: "absolute",
                      left: "-12.05%",
                      top: "-10%",
                      width: "120%",
                      height: "120%",
                      maxWidth: "none",
                      opacity: 0.6,
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Traveller — sits on top of smartphone, bottom-right aligned */}
            <img
              src={imgTraveller}
              alt="Traveller"
              className="relative z-10"
              style={{
                width: "343px",
                height: "391px",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          </div>

        </div>
      </motion.div>
    </div>
  );
}