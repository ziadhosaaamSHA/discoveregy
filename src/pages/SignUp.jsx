import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  Globe,
  Calendar,
  Languages,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const NATIONALITIES = [
  { value: "Egyptian", labelEn: "Egyptian", labelAr: "مصري" },
  { value: "American", labelEn: "American", labelAr: "أمريكي" },
  { value: "British", labelEn: "British", labelAr: "بريطاني" },
  { value: "Canadian", labelEn: "Canadian", labelAr: "كندي" },
  { value: "French", labelEn: "French", labelAr: "فرنسي" },
  { value: "German", labelEn: "German", labelAr: "ألماني" },
  { value: "Italian", labelEn: "Italian", labelAr: "إيطالي" },
  { value: "Spanish", labelEn: "Spanish", labelAr: "إسباني" },
  { value: "Australian", labelEn: "Australian", labelAr: "أسترالي" },
  { value: "Japanese", labelEn: "Japanese", labelAr: "ياباني" },
  { value: "Chinese", labelEn: "Chinese", labelAr: "صيني" },
  { value: "Indian", labelEn: "Indian", labelAr: "هندي" },
  { value: "Brazilian", labelEn: "Brazilian", labelAr: "برازيلي" },
  { value: "Mexican", labelEn: "Mexican", labelAr: "مكسيكي" },
  { value: "South Korean", labelEn: "South Korean", labelAr: "كوري جنوبي" },
  { value: "Turkish", labelEn: "Turkish", labelAr: "تركي" },
  { value: "Russian", labelEn: "Russian", labelAr: "روسي" },
  { value: "Saudi Arabian", labelEn: "Saudi Arabian", labelAr: "سعودي" },
  { value: "Emirati", labelEn: "Emirati", labelAr: "إماراتي" },
  { value: "Other", labelEn: "Other", labelAr: "أخرى" },
];

const LANGUAGES = [
  { value: "Arabic", labelEn: "Arabic", labelAr: "العربية" },
  { value: "English", labelEn: "English", labelAr: "الإنجليزية" },
  { value: "French", labelEn: "French", labelAr: "الفرنسية" },
  { value: "Spanish", labelEn: "Spanish", labelAr: "الإسبانية" },
  { value: "German", labelEn: "German", labelAr: "الألمانية" },
  { value: "Italian", labelEn: "Italian", labelAr: "الإيطالية" },
  { value: "Russian", labelEn: "Russian", labelAr: "الروسية" },
  { value: "Chinese", labelEn: "Chinese", labelAr: "الصينية" },
  { value: "Japanese", labelEn: "Japanese", labelAr: "اليابانية" },
  { value: "Portuguese", labelEn: "Portuguese", labelAr: "البرتغالية" },
];

const GENDERS = [
  { value: "Male", labelEn: "Male", labelAr: "ذكر" },
  { value: "Female", labelEn: "Female", labelAr: "أنثى" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userType, setUserType] = useState("tourist");
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { language, t, isRTL } = useLanguage();

  const fieldClass = (hasError) =>
    `w-full px-4 py-3 border rounded-xl outline-none transition-all text-sm ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
    }`;

  const inputPadding = isRTL ? "pr-11" : "pl-11";
  const signupSchema = useMemo(() => {
    const baseSchema = {
      name: Yup.string().min(2, t("auth.nameMin2")).required(t("auth.nameRequired")),
      email: Yup.string()
        .email(t("auth.invalidEmail"))
        .required(t("auth.emailRequired")),
      phone: Yup.string()
        .matches(/^[+]?[\d\s()-]{7,15}$/, t("auth.phoneInvalid"))
        .required(t("auth.phoneRequired")),
      gender: Yup.string().required(t("auth.genderRequired")),
      age: Yup.number()
        .typeError(t("auth.ageNumber"))
        .min(16, t("auth.ageMin"))
        .max(100, t("auth.ageMax"))
        .required(t("auth.ageRequired")),
      password: Yup.string()
        .min(6, t("auth.passwordMin6"))
        .required(t("auth.passwordRequired")),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], t("auth.passwordsMatch"))
        .required(t("auth.confirmRequired")),
    };

    return userType === "tourist"
      ? Yup.object().shape({
          ...baseSchema,
          nationality: Yup.string().required(t("auth.nationalityRequired")),
        })
      : Yup.object().shape({
          ...baseSchema,
          languages: Yup.array()
            .min(1, t("auth.selectAtLeastOneLanguage"))
            .required(t("auth.languagesRequired")),
        });
  }, [t, userType]);

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    gender: "",
    age: "",
    password: "",
    confirmPassword: "",
    nationality: "",
    languages: [],
  };

  const handleSubmit = (values, { setSubmitting }) => {
    setError("");
    const extra = {
      phone: values.phone,
      gender: values.gender,
      age: Number(values.age),
    };

    if (userType === "tourist") {
      extra.nationality = values.nationality;
    } else {
      extra.languages = values.languages;
    }

    const result = signup(
      values.name,
      values.email,
      values.password,
      userType,
      extra
    );

    if (result.success) {
      navigate("/");
    } else {
      setError(
        result.error === "Email already exists"
          ? t("auth.emailExists")
          : result.error
      );
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8"
      >
        <h1 className="text-center text-2xl font-bold text-secondary mb-2">
          {t("auth.createAccountTitle")}
        </h1>
        <p className="text-center text-muted text-sm mb-6">
          {t("auth.createAccountSubtitle")}
        </p>

        <div dir="ltr" className="relative flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
          <motion.div
            layout
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-secondary rounded-lg shadow-sm"
            style={{ left: userType === "tourist" ? 4 : "calc(50% + 0px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          />
          <button
            type="button"
            onClick={() => setUserType("tourist")}
            className={`relative z-10 flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              userType === "tourist" ? "text-white" : "text-secondary"
            }`}
          >
            {t("auth.tourist")}
          </button>
          <button
            type="button"
            onClick={() => setUserType("guide")}
            className={`relative z-10 flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              userType === "guide" ? "text-white" : "text-secondary"
            }`}
          >
            {t("auth.guide")}
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
          >
            {error}
          </motion.div>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={signupSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, values, setFieldValue }) => (
            <Form className="space-y-4">
              <div>
                <div className={`relative ${isRTL ? "text-right" : ""}`}>
                  <User
                    size={18}
                    className={`absolute top-1/2 -translate-y-1/2 text-muted pointer-events-none ${
                      isRTL ? "right-3.5" : "left-3.5"
                    }`}
                  />
                  <Field
                    name="name"
                    type="text"
                    placeholder={t("auth.namePlaceholder")}
                    className={`${fieldClass(errors.name && touched.name)} ${inputPadding}`}
                  />
                </div>
                {errors.name && touched.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Mail
                    size={18}
                    className={`absolute top-1/2 -translate-y-1/2 text-muted pointer-events-none ${
                      isRTL ? "right-3.5" : "left-3.5"
                    }`}
                  />
                  <Field
                    name="email"
                    type="email"
                    placeholder={t("auth.emailAddress")}
                    className={`${fieldClass(errors.email && touched.email)} ${inputPadding}`}
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Phone
                    size={18}
                    className={`absolute top-1/2 -translate-y-1/2 text-muted pointer-events-none ${
                      isRTL ? "right-3.5" : "left-3.5"
                    }`}
                  />
                  <Field
                    name="phone"
                    type="tel"
                    placeholder={t("auth.phonePlaceholder")}
                    className={`${fieldClass(errors.phone && touched.phone)} ${inputPadding} ${isRTL ? "text-right" : ""}`}
                  />
                </div>
                {errors.phone && touched.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <User
                      size={18}
                      className={`absolute top-1/2 -translate-y-1/2 text-muted pointer-events-none ${
                        isRTL ? "right-3.5" : "left-3.5"
                      }`}
                    />
                    <Field
                      as="select"
                      name="gender"
                      className={`${fieldClass(
                        errors.gender && touched.gender
                      )} appearance-none cursor-pointer ${!values.gender ? "text-muted" : ""} ${inputPadding}`}
                    >
                      <option value="" disabled>
                        {t("auth.selectGender")}
                      </option>
                      {GENDERS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {language === "ar" ? g.labelAr : g.labelEn}
                        </option>
                      ))}
                    </Field>
                  </div>
                  {errors.gender && touched.gender && (
                    <p className="mt-1 text-xs text-red-500">{errors.gender}</p>
                  )}
                </div>

                <div className="w-28">
                  <div className="relative">
                    <Calendar
                      size={18}
                      className={`absolute top-1/2 -translate-y-1/2 text-muted pointer-events-none ${
                        isRTL ? "right-3.5" : "left-3.5"
                      }`}
                    />
                    <Field
                      name="age"
                      type="number"
                      placeholder={t("auth.agePlaceholder")}
                      min="16"
                      max="100"
                      className={`${fieldClass(errors.age && touched.age)} ${inputPadding}`}
                    />
                  </div>
                  {errors.age && touched.age && (
                    <p className="mt-1 text-xs text-red-500">{errors.age}</p>
                  )}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {userType === "tourist" ? (
                  <motion.div
                    key="nationality"
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="relative">
                      <Globe
                        size={18}
                        className={`absolute top-1/2 -translate-y-1/2 text-muted pointer-events-none ${
                          isRTL ? "right-3.5" : "left-3.5"
                        }`}
                      />
                      <Field
                        as="select"
                        name="nationality"
                        className={`${fieldClass(
                          errors.nationality && touched.nationality
                        )} appearance-none cursor-pointer ${!values.nationality ? "text-muted" : ""} ${inputPadding}`}
                      >
                        <option value="" disabled>
                          {t("auth.selectNationality")}
                        </option>
                        {NATIONALITIES.map((n) => (
                          <option key={n.value} value={n.value}>
                            {language === "ar" ? n.labelAr : n.labelEn}
                          </option>
                        ))}
                      </Field>
                    </div>
                    {errors.nationality && touched.nationality && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.nationality}
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="languages"
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="relative">
                      <Languages
                        size={18}
                        className={`absolute top-3 text-muted pointer-events-none ${
                          isRTL ? "right-3.5" : "left-3.5"
                        }`}
                      />
                      <div
                        className={`w-full px-4 py-3 border rounded-xl transition-all min-h-[48px] ${
                          errors.languages && touched.languages
                            ? "border-red-400"
                            : "border-gray-200"
                        } ${inputPadding}`}
                      >
                        {values.languages.length === 0 && (
                          <span className="text-sm text-muted">
                            {t("auth.selectLanguages")}
                          </span>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {LANGUAGES.map((lang) => {
                            const selected = values.languages.includes(lang.value);
                            return (
                              <button
                                key={lang.value}
                                type="button"
                                onClick={() => {
                                  const next = selected
                                    ? values.languages.filter((l) => l !== lang.value)
                                    : [...values.languages, lang.value];
                                  setFieldValue("languages", next);
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                  selected
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {language === "ar" ? lang.labelAr : lang.labelEn}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    {errors.languages && touched.languages && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.languages}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <div className="relative">
                  <Lock
                    size={18}
                    className={`absolute top-1/2 -translate-y-1/2 text-muted pointer-events-none ${
                      isRTL ? "right-3.5" : "left-3.5"
                    }`}
                  />
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    dir="ltr"
                    placeholder={t("auth.password")}
                    className={`${fieldClass(errors.password && touched.password)} !pl-11 !pr-12 text-${isRTL ? "right" : "left"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors ${
                      isRTL ? "left-3" : "right-3"
                    }`}
                    aria-label={
                      showPassword ? t("auth.hidePassword") : t("auth.showPassword")
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Lock
                    size={18}
                    className={`absolute top-1/2 -translate-y-1/2 text-muted pointer-events-none ${
                      isRTL ? "right-3.5" : "left-3.5"
                    }`}
                  />
                  <Field
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    dir="ltr"
                    placeholder={t("auth.confirmPassword")}
                    className={`${fieldClass(
                      errors.confirmPassword && touched.confirmPassword
                    )} !pl-11 !pr-12 text-${isRTL ? "right" : "left"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className={`absolute top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors ${
                      isRTL ? "left-3" : "right-3"
                    }`}
                    aria-label={
                      showConfirm ? t("auth.hidePassword") : t("auth.showPassword")
                    }
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50 mt-4 shadow-sm"
              >
                {isSubmitting ? t("auth.createLoading") : t("auth.createButton")}
              </button>
            </Form>
          )}
        </Formik>

        <p className="mt-6 text-center text-sm text-muted">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            {t("auth.signIn")}
          </Link>
        </p>

        <div className="mt-6">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-muted">{t("auth.orConnectWith")}</span>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button
              type="button"
              className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all"
              aria-label={`${t("auth.signUp")} ${t("auth.facebook")}`}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
            <button
              type="button"
              className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all"
              aria-label={`${t("auth.signUp")} ${t("auth.google")}`}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>
            <button
              type="button"
              className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all"
              aria-label={`${t("auth.signUp")} ${t("auth.instagram")}`}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFDC80" />
                    <stop offset="50%" stopColor="#F56040" />
                    <stop offset="100%" stopColor="#C13584" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#ig-gradient)"
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
