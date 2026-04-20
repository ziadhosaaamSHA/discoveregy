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

// ── Figma assets (same page, same beige card) ──
const imgBackground    = "http://localhost:3845/assets/60854d0f90c724d6a8d1ba05aa4e38b870012968.png";
const imgSmartphone    = "http://localhost:3845/assets/c8c5dd0d1c7608aaca2f024c896b513ec2017668.png";
const imgTraveller     = "http://localhost:3845/assets/c8dfa6312c2d8ae9f9373b8ebeb680371e67d3a1.png";
const imgBackIcon      = "http://localhost:3845/assets/6235413aa7ab9a66ee4722fb5888215567271838.svg";
const imgDeviconGoogle = "http://localhost:3845/assets/999bcb7d25735ca4686374c0705b5e744ead0ba8.svg";
const imgInstagram     = "http://localhost:3845/assets/87e560a6cf646bc9e704bfcb99191e4086b80c9d.svg";
const imgFacebook      = "http://localhost:3845/assets/3a5b2589104f8c803aa1fc6cf148dada39e075d8.svg";

// ── Data (unchanged from original) ──
const NATIONALITIES = [
  { value: "Egyptian",     labelEn: "Egyptian",     labelAr: "مصري" },
  { value: "American",     labelEn: "American",     labelAr: "أمريكي" },
  { value: "British",      labelEn: "British",      labelAr: "بريطاني" },
  { value: "Canadian",     labelEn: "Canadian",     labelAr: "كندي" },
  { value: "French",       labelEn: "French",       labelAr: "فرنسي" },
  { value: "German",       labelEn: "German",       labelAr: "ألماني" },
  { value: "Italian",      labelEn: "Italian",      labelAr: "إيطالي" },
  { value: "Spanish",      labelEn: "Spanish",      labelAr: "إسباني" },
  { value: "Australian",   labelEn: "Australian",   labelAr: "أسترالي" },
  { value: "Japanese",     labelEn: "Japanese",     labelAr: "ياباني" },
  { value: "Chinese",      labelEn: "Chinese",      labelAr: "صيني" },
  { value: "Indian",       labelEn: "Indian",       labelAr: "هندي" },
  { value: "Brazilian",    labelEn: "Brazilian",    labelAr: "برازيلي" },
  { value: "Mexican",      labelEn: "Mexican",      labelAr: "مكسيكي" },
  { value: "South Korean", labelEn: "South Korean", labelAr: "كوري جنوبي" },
  { value: "Turkish",      labelEn: "Turkish",      labelAr: "تركي" },
  { value: "Russian",      labelEn: "Russian",      labelAr: "روسي" },
  { value: "Saudi Arabian",labelEn: "Saudi Arabian",labelAr: "سعودي" },
  { value: "Emirati",      labelEn: "Emirati",      labelAr: "إماراتي" },
  { value: "Other",        labelEn: "Other",        labelAr: "أخرى" },
];

const LANGUAGES = [
  { value: "Arabic",     labelEn: "Arabic",     labelAr: "العربية" },
  { value: "English",    labelEn: "English",    labelAr: "الإنجليزية" },
  { value: "French",     labelEn: "French",     labelAr: "الفرنسية" },
  { value: "Spanish",    labelEn: "Spanish",    labelAr: "الإسبانية" },
  { value: "German",     labelEn: "German",     labelAr: "الألمانية" },
  { value: "Italian",    labelEn: "Italian",    labelAr: "الإيطالية" },
  { value: "Russian",    labelEn: "Russian",    labelAr: "الروسية" },
  { value: "Chinese",    labelEn: "Chinese",    labelAr: "الصينية" },
  { value: "Japanese",   labelEn: "Japanese",   labelAr: "اليابانية" },
  { value: "Portuguese", labelEn: "Portuguese", labelAr: "البرتغالية" },
];

const GENDERS = [
  { value: "Male",   labelEn: "Male",   labelAr: "ذكر" },
  { value: "Female", labelEn: "Female", labelAr: "أنثى" },
];

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,   transition: { duration: 0.3 } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [userType,     setUserType]     = useState("tourist");
  const [error,        setError]        = useState("");
  const { signup }   = useAuth();
  const navigate     = useNavigate();
  const { language, t, isRTL } = useLanguage();

  // ── Figma colors applied to field class helper ──
  // border → #e0e0e0  |  focus border → #d4800b  |  error → #f87171
  const fieldClass = (hasError) =>
    `w-full px-4 py-3 rounded-xl outline-none transition-all text-sm ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
        : "focus:ring-2"
    }`;

  const fieldStyle = (hasError) => ({
    border: hasError ? "1.5px solid #f87171" : "1px solid #e0e0e0",
    borderRadius: "14px",
    fontSize: "14px",
    color: "#333",
    backgroundColor: "#fff",
    // focus ring colour handled via inline onFocus/onBlur or Tailwind ring
  });

  const inputPadding = isRTL ? "pr-11" : "pl-11";

  const signupSchema = useMemo(() => {
    const baseSchema = {
      firstName:       Yup.string().min(2, t("auth.nameMin2")).required(t("auth.firstNameRequired")),
      lastName:        Yup.string().min(2, t("auth.nameMin2")).required(t("auth.lastNameRequired")),
      email:           Yup.string().email(t("auth.invalidEmail")).required(t("auth.emailRequired")),
      phone:           Yup.string().matches(/^[+]?[\d\s()-]{7,15}$/, t("auth.phoneInvalid")).required(t("auth.phoneRequired")),
      gender:          Yup.string().required(t("auth.genderRequired")),
      dateOfBirth:     Yup.date().required(t("auth.dobRequired")),
      password:        Yup.string().min(6, t("auth.passwordMin6")).required(t("auth.passwordRequired")),
      confirmPassword: Yup.string().oneOf([Yup.ref("password")], t("auth.passwordsMatch")).required(t("auth.confirmRequired")),
    };

    if (userType === "tourist") {
      return Yup.object().shape({ ...baseSchema, nationality: Yup.string().required(t("auth.nationalityRequired")) });
    } else {
      return Yup.object().shape({
        ...baseSchema,
        nationality: Yup.string().required(t("auth.nationalityRequired")),
        languages: Yup.array().min(1, t("auth.selectAtLeastOneLanguage")).required(t("auth.languagesRequired")),
        licenseId: Yup.string().required(t("auth.licenseIdRequired")),
        licenseImage: Yup.mixed().required(t("auth.licenseImageRequired")),
      });
    }
  }, [t, userType]);

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
    nationality: "",
    languages: [],
    licenseId: "",
    licenseImage: null,
  };

  const handleSubmit = (values, { setSubmitting }) => {
    setError("");
    const extra = {
      phone: values.phone,
      gender: values.gender,
      dateOfBirth: values.dateOfBirth,
      nationality: values.nationality,
    };
    if (userType === "guide") {
      extra.languages = values.languages;
      extra.licenseId = values.licenseId;
      extra.licenseImage = values.licenseImage;
    }

    const result = signup(values.firstName + " " + values.lastName, values.email, values.password, userType, extra);
    if (result.success) {
      navigate("/home");
    } else {
      setError(result.error === "Email already exists" ? t("auth.emailExists") : result.error);
    }
    setSubmitting(false);
  };

  return (
    /* ── Full-page background image (same as Login) ── */
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

      {/* ── Large beige rounded card (same as Login) ── */}
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
            {t("auth.createAccountTitle")}
          </h1>
          <p className="text-lg font-medium mt-1" style={{ color: "#837e77" }}>
            {t("auth.createAccountSubtitle")}
          </p>
        </div>

        {/* Two-column row */}
        <div className={`flex gap-8 px-16 pb-12 pt-6 items-center justify-center ${isRTL ? "flex-row-reverse" : "flex-row"}`}>

          {/* ── White form card ── */}
          <div className="flex-shrink-0 w-full max-w-md">
            <div
              className="bg-white overflow-hidden p-8"
              style={{ borderRadius: "20px", boxShadow: "2px 4px 4px 0px rgba(0,0,0,0.25)" }}
            >
              {/* Form title */}
              <h2
                className="text-center font-extrabold mb-2"
                style={{ color: "#d4800b", fontSize: "25px", fontFamily: "Inter, sans-serif" }}
              >
                {t("auth.createAccountTitle")}
              </h2>
              <p className="text-center text-sm mb-4" style={{ color: "#aea9a9" }}>
                {t("auth.createAccountSubtitle")}
              </p>

              {/* Tourist / Guide toggle — original structure preserved */}
              <div dir="ltr" className="relative flex gap-1 mb-5 rounded-xl p-1" style={{ backgroundColor: "#f7f7f9" }}>
                <motion.div
                  layout
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg shadow-sm"
                  style={{
                    left: userType === "tourist" ? 4 : "calc(50% + 0px)",
                    backgroundColor: "#d4800b",
                  }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
                <button
                  type="button"
                  onClick={() => setUserType("tourist")}
                  className="relative z-10 flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                  style={{ color: userType === "tourist" ? "#fff" : "#d4800b" }}
                >
                  {t("auth.tourist")}
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("guide")}
                  className="relative z-10 flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                  style={{ color: userType === "guide" ? "#fff" : "#d4800b" }}
                >
                  {t("auth.guide")}
                </button>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <Formik initialValues={initialValues} validationSchema={signupSchema} onSubmit={handleSubmit}>
                {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                  <Form className="space-y-3">

                    {/* First & Last Name */}
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <div className="relative">
                          <User size={16} className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRTL ? "right-3.5" : "left-3.5"}`} style={{ color: "#aea9a9" }} />
                          <Field
                            name="firstName" type="text"
                            placeholder={t("auth.firstNamePlaceholder")}
                            className={`${fieldClass(errors.firstName && touched.firstName)} ${inputPadding}`}
                            style={fieldStyle(errors.firstName && touched.firstName)}
                          />
                        </div>
                        {errors.firstName && touched.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                      </div>
                      <div className="flex-1">
                        <div className="relative">
                          <User size={16} className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRTL ? "right-3.5" : "left-3.5"}`} style={{ color: "#aea9a9" }} />
                          <Field
                            name="lastName" type="text"
                            placeholder={t("auth.lastNamePlaceholder")}
                            className={`${fieldClass(errors.lastName && touched.lastName)} ${inputPadding}`}
                            style={fieldStyle(errors.lastName && touched.lastName)}
                          />
                        </div>
                        {errors.lastName && touched.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <div className="relative">
                        <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRTL ? "right-3.5" : "left-3.5"}`} style={{ color: "#aea9a9" }} />
                        <Field
                          name="email" type="email"
                          placeholder={t("auth.emailAddress")}
                          className={`${fieldClass(errors.email && touched.email)} ${inputPadding}`}
                          style={fieldStyle(errors.email && touched.email)}
                        />
                      </div>
                      {errors.email && touched.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <div className="relative">
                        <Phone size={16} className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRTL ? "right-3.5" : "left-3.5"}`} style={{ color: "#aea9a9" }} />
                        <Field
                          name="phone" type="tel"
                          placeholder={t("auth.phonePlaceholder")}
                          className={`${fieldClass(errors.phone && touched.phone)} ${inputPadding} ${isRTL ? "text-right" : ""}`}
                          style={fieldStyle(errors.phone && touched.phone)}
                        />
                      </div>
                      {errors.phone && touched.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    </div>

                    {/* Gender + DOB row */}
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <div className="relative">
                          <User size={16} className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRTL ? "right-3.5" : "left-3.5"}`} style={{ color: "#aea9a9" }} />
                          <Field
                            as="select" name="gender"
                            className={`${fieldClass(errors.gender && touched.gender)} appearance-none cursor-pointer ${inputPadding}`}
                            style={{ ...fieldStyle(errors.gender && touched.gender), color: !values.gender ? "#aea9a9" : "#333" }}
                          >
                            <option value="" disabled>{t("auth.selectGender")}</option>
                            {GENDERS.map(g => <option key={g.value} value={g.value}>{language === "ar" ? g.labelAr : g.labelEn}</option>)}
                          </Field>
                        </div>
                        {errors.gender && touched.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
                      </div>

                      <div className="flex-1">
                        <div className="relative">
                          <Calendar size={16} className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRTL ? "right-3.5" : "left-3.5"}`} style={{ color: "#aea9a9" }} />
                          <Field
                            name="dateOfBirth" type="date"
                            placeholder={t("auth.dobPlaceholder")}
                            className={`${fieldClass(errors.dateOfBirth && touched.dateOfBirth)} ${inputPadding}`}
                            style={{ ...fieldStyle(errors.dateOfBirth && touched.dateOfBirth), color: !values.dateOfBirth ? "#aea9a9" : "#333" }}
                          />
                        </div>
                        {errors.dateOfBirth && touched.dateOfBirth && <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth}</p>}
                      </div>
                    </div>

                    {/* Nationality (tourist) / Languages (guide) */}
                    <AnimatePresence mode="wait">
                      {userType === "tourist" ? (
                        <motion.div key="nationality" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                          <div className="relative">
                            <Globe size={16} className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRTL ? "right-3.5" : "left-3.5"}`} style={{ color: "#aea9a9" }} />
                            <Field
                              as="select" name="nationality"
                              className={`${fieldClass(errors.nationality && touched.nationality)} appearance-none cursor-pointer ${inputPadding}`}
                              style={{ ...fieldStyle(errors.nationality && touched.nationality), color: !values.nationality ? "#aea9a9" : "#333" }}
                            >
                              <option value="" disabled>{t("auth.selectNationality")}</option>
                              {NATIONALITIES.map(n => <option key={n.value} value={n.value}>{language === "ar" ? n.labelAr : n.labelEn}</option>)}
                            </Field>
                          </div>
                          {errors.nationality && touched.nationality && <p className="mt-1 text-xs text-red-500">{errors.nationality}</p>}
                        </motion.div>
                      ) : (
                        <motion.div key="guide-fields" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-3">
                          {/* Nationality */}
                          <div className="relative">
                            <Globe size={16} className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRTL ? "right-3.5" : "left-3.5"}`} style={{ color: "#aea9a9" }} />
                            <Field
                              as="select" name="nationality"
                              className={`${fieldClass(errors.nationality && touched.nationality)} appearance-none cursor-pointer ${inputPadding}`}
                              style={{ ...fieldStyle(errors.nationality && touched.nationality), color: !values.nationality ? "#aea9a9" : "#333" }}
                            >
                              <option value="" disabled>{t("auth.selectNationality")}</option>
                              {NATIONALITIES.map(n => <option key={n.value} value={n.value}>{language === "ar" ? n.labelAr : n.labelEn}</option>)}
                            </Field>
                          </div>
                          {errors.nationality && touched.nationality && <p className="mt-1 text-xs text-red-500">{errors.nationality}</p>}

                          {/* Languages */}
                          <div className="relative">
                            <Languages size={16} className={`absolute top-3 pointer-events-none ${isRTL ? "right-3.5" : "left-3.5"}`} style={{ color: "#aea9a9" }} />
                            <div
                              className={`w-full px-4 py-3 min-h-[48px] ${inputPadding}`}
                              style={{
                                border: errors.languages && touched.languages ? "1.5px solid #f87171" : "1px solid #e0e0e0",
                                borderRadius: "14px",
                              }}
                            >
                              {values.languages.length === 0 && (
                                <span className="text-sm" style={{ color: "#aea9a9" }}>{t("auth.selectLanguages")}</span>
                              )}
                              <div className="flex flex-wrap gap-2">
                                {LANGUAGES.map(lang => {
                                  const selected = values.languages.includes(lang.value);
                                  return (
                                    <button
                                      key={lang.value} type="button"
                                      onClick={() => {
                                        const next = selected
                                          ? values.languages.filter(l => l !== lang.value)
                                          : [...values.languages, lang.value];
                                        setFieldValue("languages", next);
                                      }}
                                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                                      style={{
                                        backgroundColor: selected ? "#d4800b" : "#f7f7f9",
                                        color: selected ? "#fff" : "#555",
                                      }}
                                    >
                                      {language === "ar" ? lang.labelAr : lang.labelEn}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          {errors.languages && touched.languages && <p className="mt-1 text-xs text-red-500">{errors.languages}</p>}

                          {/* License ID */}
                          <div className="relative">
                            <Field
                              name="licenseId" type="text"
                              placeholder={t("auth.licenseIdPlaceholder")}
                              className={fieldClass(errors.licenseId && touched.licenseId)}
                              style={fieldStyle(errors.licenseId && touched.licenseId)}
                            />
                          </div>
                          {errors.licenseId && touched.licenseId && <p className="mt-1 text-xs text-red-500">{errors.licenseId}</p>}

                          {/* License Image */}
                          <div className="relative">
                            <input
                              id="licenseImage"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => setFieldValue("licenseImage", e.currentTarget.files[0])}
                            />
                            <label
                              htmlFor="licenseImage"
                              className={`flex items-center justify-center w-full px-4 py-3 cursor-pointer rounded-xl transition-all text-sm border ${
                                errors.licenseImage && touched.licenseImage
                                  ? "border-red-400 text-red-500"
                                  : "border-gray-300 text-gray-500 hover:border-orange-500"
                              }`}
                            >
                              {values.licenseImage ? values.licenseImage.name : t("auth.uploadLicenseImage")}
                            </label>
                          </div>
                          {errors.licenseImage && touched.licenseImage && <p className="mt-1 text-xs text-red-500">{errors.licenseImage}</p>}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Password */}
                    <div>
                      <div className="relative">
                        <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRTL ? "right-3.5" : "left-3.5"}`} style={{ color: "#aea9a9" }} />
                        <Field
                          name="password" type={showPassword ? "text" : "password"} dir="ltr"
                          placeholder={t("auth.password")}
                          className={`${fieldClass(errors.password && touched.password)} !pl-11 !pr-12`}
                          style={fieldStyle(errors.password && touched.password)}
                        />
                        <button
                          type="button" onClick={() => setShowPassword(!showPassword)}
                          className={`absolute top-1/2 -translate-y-1/2 transition-colors ${isRTL ? "left-3" : "right-3"}`}
                          style={{ color: "#aea9a9" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#d4800b"}
                          onMouseLeave={e => e.currentTarget.style.color = "#aea9a9"}
                          aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && touched.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                    </div>

                    {/* Confirm password */}
                    <div>
                      <div className="relative">
                        <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRTL ? "right-3.5" : "left-3.5"}`} style={{ color: "#aea9a9" }} />
                        <Field
                          name="confirmPassword" type={showConfirm ? "text" : "password"} dir="ltr"
                          placeholder={t("auth.confirmPassword")}
                          className={`${fieldClass(errors.confirmPassword && touched.confirmPassword)} !pl-11 !pr-12`}
                          style={fieldStyle(errors.confirmPassword && touched.confirmPassword)}
                        />
                        <button
                          type="button" onClick={() => setShowConfirm(!showConfirm)}
                          className={`absolute top-1/2 -translate-y-1/2 transition-colors ${isRTL ? "left-3" : "right-3"}`}
                          style={{ color: "#aea9a9" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#d4800b"}
                          onMouseLeave={e => e.currentTarget.style.color = "#aea9a9"}
                          aria-label={showConfirm ? t("auth.hidePassword") : t("auth.showPassword")}
                        >
                          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.confirmPassword && touched.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                    </div>

                    {/* Submit button — Figma: #d4800b, rounded-[14px], shadow */}
                    <button
                      type="submit" disabled={isSubmitting}
                      className="w-full py-3 text-white font-semibold transition-colors disabled:opacity-50 mt-2"
                      style={{
                        backgroundColor: "#d4800b",
                        borderRadius: "14px",
                        boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.25)",
                        fontSize: "16px",
                      }}
                      onMouseEnter={e => !isSubmitting && (e.currentTarget.style.backgroundColor = "#bc710a")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#d4800b")}
                    >
                      {isSubmitting ? t("auth.createLoading") : t("auth.createButton")}
                    </button>
                  </Form>
                )}
              </Formik>

              {/* Already have account — Figma: #707b81 / #d4800b */}
              <p className="mt-5 text-center text-sm" style={{ color: "#707b81" }}>
                {t("auth.alreadyHaveAccount")}{" "}
                <Link to="/login" className="font-medium hover:underline" style={{ color: "#d4800b" }}>
                  {t("auth.signIn")}
                </Link>
              </p>

              {/* Or + socials */}
              <div className="mt-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ backgroundColor: "#e0e0e0" }} />
                  <span className="text-sm font-semibold" style={{ color: "#80888a" }}>{t("auth.orConnectWith")}</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: "#e0e0e0" }} />
                </div>
                <div className="flex justify-center gap-4">
                  <button type="button" className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors" style={{ border: "1px solid #e5e7eb" }} aria-label={t("auth.facebook")}>
                    <img src={imgFacebook} alt="Facebook" className="w-6 h-6 object-contain" />
                  </button>
                  <button type="button" className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors" style={{ border: "1px solid #e5e7eb" }} aria-label={t("auth.google")}>
                    <img src={imgDeviconGoogle} alt="Google" className="w-6 h-6 object-contain" />
                  </button>
                  <button type="button" className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors" style={{ border: "1px solid #e5e7eb" }} aria-label={t("auth.instagram")}>
                    <img src={imgInstagram} alt="Instagram" className="w-6 h-6 object-contain" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/*
           * ── Right side: smartphone + traveller ──
           * Exact same Figma transforms as Login.
           * hidden on mobile, visible lg+
           */}
          <div className="hidden lg:flex flex-1 relative items-end justify-center" style={{ minHeight: "520px" }}>

            {/* Smartphone — rotate(-16.15deg) skewX(0.14deg), opacity 0.6, image 120% oversized */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ top: "-20px" }}>
              <div style={{ transform: "rotate(-16.15deg) skewX(0.14deg)", width: "100%", height: "100%", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                  <img
                    alt="" src={imgSmartphone}
                    style={{
                      position: "absolute",
                      left: "-12.05%", top: "-10%",
                      width: "120%", height: "120%",
                      maxWidth: "none",
                      opacity: 0.6,
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Traveller on top */}
            <img
              src={imgTraveller} alt="Traveller"
              className="relative z-10"
              style={{ width: "343px", height: "391px", objectFit: "cover", flexShrink: 0 }}
            />
          </div>

        </div>
      </motion.div>
    </div>
  );
}