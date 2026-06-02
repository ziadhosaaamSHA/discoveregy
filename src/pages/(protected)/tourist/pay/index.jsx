import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { User, MapPin, Phone, CalendarDays, Wallet } from "lucide-react";
import { useLanguage } from "../../../../context/LanguageContext";
import { readBookingInfo, saveBookingInfo } from "../../../../services/booking-session";
import { InputField } from "./components/InputField";

// Pay captures booking details and stores booking context before plan selection.
export default function PayPage() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const destId = queryParams.get("destId");
  const savedBookingInfo = readBookingInfo();

  const BookingSchema = Yup.object().shape({
    firstName: Yup.string().min(2, t("validation.nameMin2")).required(t("validation.required")),
    lastName: Yup.string().min(2, t("validation.nameMin2")).required(t("validation.required")),
    address: Yup.string().min(10, t("validation.addressMin")).required(t("validation.required")),
    phone: Yup.string().matches(/^[0-9]{10,15}$/, t("validation.phoneInvalid")).required(t("validation.required")),
    date: Yup.date().min(new Date(), t("validation.futureDate")).required(t("validation.required")),
    paymentMethod: Yup.string().required(t("validation.paymentMethodRequired")),
  });

  const initialValues = {
    firstName: savedBookingInfo.firstName || "",
    lastName: savedBookingInfo.lastName || "",
    address: savedBookingInfo.address || "",
    date: savedBookingInfo.date || "",
    phone: savedBookingInfo.phone || "",
    paymentMethod: savedBookingInfo.paymentMethod || "",
  };

  const handleSubmit = (values, { setSubmitting }) => {
    saveBookingInfo({ ...values, numberOfPeople: 1 });
    
    // Redirect to plans with the destination context preserved
    const targetPath = destId ? `/tourist/plans?destId=${destId}` : "/tourist/plans";
    navigate(targetPath);
    setSubmitting(false);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        direction: isRTL ? "rtl" : "ltr",
        backgroundImage: "url('/images/bookingBackground.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 z-20 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
      >
        <img src="/images/back-svgrepo-com 1.svg" alt="back" className="w-6 h-6" />
      </button>

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[780px] rounded-[24px] p-8 bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl"
        >
          <div className="text-center mb-7">
            <h1 className="text-[32px] font-black text-black tracking-tight">{t("booking.title")}</h1>
            <p className="font-semibold text-[14px] mt-1 text-white">{t("booking.bookingInstructions")}</p>
          </div>

          <Formik initialValues={initialValues} validationSchema={BookingSchema} onSubmit={handleSubmit}>
            {({ errors, touched, values, setFieldValue, isSubmitting }) => (
              <Form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex flex-col gap-4">
                  <InputField icon={User} name="firstName" placeholder={t("auth.firstNamePlaceholder")} errors={errors} touched={touched} />
                  <InputField icon={User} name="lastName" placeholder={t("auth.lastNamePlaceholder")} errors={errors} touched={touched} />
                  <InputField icon={MapPin} name="address" placeholder={t("booking.addressPlaceholder")} errors={errors} touched={touched} />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "linear-gradient(135deg, #c9a96e 0%, #d4b483 100%)", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.2)" }}>
                      <CalendarDays size={18} className="text-gray-800 shrink-0" />
                      <Field type="date" name="date" className="bg-transparent flex-1 text-gray-900 text-[14px] font-medium outline-none cursor-pointer" />
                    </div>
                    {errors.date && touched.date && <p className="text-red-300 text-xs px-2">{errors.date}</p>}
                  </div>
                  <InputField icon={Phone} name="phone" type="tel" placeholder={t("booking.phonePlaceholder")} errors={errors} touched={touched} />
                  
                  {/* Payment selection moved here */}
                  <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg, #c9a96e 0%, #d4b483 100%)", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.2)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet size={17} className="text-gray-800 shrink-0" />
                      <span className="text-[13px] font-semibold text-gray-800">{t("booking.paymentMethod")}</span>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setFieldValue("paymentMethod", "Visa")} className={`flex-1 py-3 rounded-xl font-black text-[16px] transition-all ${values.paymentMethod === "Visa" ? "bg-[#E8A020] text-white" : "bg-black text-white"}`}>VISA</button>
                      <button type="button" onClick={() => setFieldValue("paymentMethod", "Cash")} className={`flex-1 py-3 rounded-xl font-black text-[16px] transition-all ${values.paymentMethod === "Cash" ? "bg-[#E8A020] text-white" : "bg-black text-white"}`}>Cash</button>
                    </div>
                    {errors.paymentMethod && touched.paymentMethod && <p className="text-red-300 text-xs px-2 mt-2">{errors.paymentMethod}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="w-full h-full flex items-center justify-center">
                        <img src="/images/visa.png" alt="Visa" className="w-full h-full object-contain" />
                    </div>

                  <div className="flex flex-col gap-3 mt-auto">
                    <button type="submit" className="w-full py-3 rounded-xl font-bold text-white text-[15px] transition-all" style={{ background: "linear-gradient(135deg, #E8A020 0%, #d4901a 100%)" }} disabled={isSubmitting}>
                      {isSubmitting ? t("booking.submitting") : t("booking.submit")}
                    </button>
                    <button type="button" onClick={() => navigate(-1)} className="w-full py-3 rounded-xl font-semibold text-black text-[15px] bg-gray-200 hover:bg-gray-300 transition-colors">
                      {t("common.cancel")}
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </motion.div>
      </main>
    </div>
  );
}
