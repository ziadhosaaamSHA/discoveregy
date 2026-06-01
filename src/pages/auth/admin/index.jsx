import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";

// Figma assets
const imgBackground    = "/images/60854d0f90c724d6a8d1ba05aa4e38b870012968.jpg";
const imgSmartphone    = "/images/c8c5dd0d1c7608aaca2f024c896b513ec2017668.png";
const imgTraveller     = "/images/c8dfa6312c2d8ae9f9373b8ebeb680371e67d3a1.png";
const imgBackIcon      = "/images/back-svgrepo-com 1.svg";
const imgDeviconGoogle = "/images/devicon_google.svg";
const imgInstagram     = "/images/instagram 3.svg";
const imgFacebook      = "/images/Group 340.svg";

// Login handles tourist and guide authentication entry into the app.
export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email(t("auth.invalidEmail")).required(t("auth.emailRequired")),
    password: Yup.string().min(6, t("auth.passwordMin6")).required(t("auth.passwordRequired")),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setError("");
    const result = await login(values.email, values.password);
    if (result.success) {
      if (result.user?.type === "admin") {
        navigate("/admin");
      } else {
        setError(t("auth.notAdmin"));
      }
    } else {
      setError(result.error || t("auth.loginError"));
    }
    setSubmitting(false);
  };

  return (
    /* Full-page background image */
<div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
  >
    {error && (
      <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
        {error}
      </div>
    )}

    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={LoginSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>

            <Field
              name="email"
              type="email"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="admin@example.com"
            />

            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>

            <div className="relative">
              <Field
                name="password"
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Enter password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && touched.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="rounded border-slate-300"
              />
              Remember me
            </label>

            <Link
              to="/forgot-password"
              className="text-sm text-slate-900 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </Form>
      )}
    </Formik>
  </motion.div>
</div>
  );
}
