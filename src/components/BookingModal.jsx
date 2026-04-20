import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { X, CheckCircle, CreditCard, Smartphone } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function BookingModal({ isOpen, onClose, destination }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t, language, isRTL } = useLanguage();

  const BookingSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, t("validation.nameMin2"))
      .required(t("validation.required")),
    phone: Yup.string()
      .matches(/^[0-9]{10,15}$/, t("validation.phoneInvalid"))
      .required(t("validation.required")),
    address: Yup.string()
      .min(10, t("validation.addressMin"))
      .required(t("validation.required")),
    date: Yup.date()
      .min(new Date(), t("validation.futureDate"))
      .required(t("validation.required")),
    paymentMethod: Yup.string()
      .oneOf(["instapay", "vodafone_cash"], t("validation.paymentMethodRequired"))
      .required(t("validation.paymentMethodRequired")),
  });

  const PAYMENT_METHODS = [
    {
      id: "instapay",
      name: t("booking.paymentOptions.instapay.name"),
      icon: CreditCard,
      description: t("booking.paymentOptions.instapay.description"),
    },
    {
      id: "vodafone_cash",
      name: t("booking.paymentOptions.vodafone_cash.name"),
      icon: Smartphone,
      description: t("booking.paymentOptions.vodafone_cash.description"),
    },
  ];

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    // Simulate API call
    setTimeout(() => {
      console.log("Booking submitted:", { ...values, destinationId: destination.id });
      setIsSubmitted(true);
      setSubmitting(false);
      resetForm();
    }, 1000);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  const destData = destination.copy[language] || destination.copy.en;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-xl font-bold text-secondary">
                {isSubmitted ? t("booking.confirmedTitle") : t("booking.title")}
              </h2>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label={t("common.close")}
              >
                <X size={20} className="text-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">
                    {t("booking.thankYou")}
                  </h3>
                  <p className="text-muted mb-2">
                    {t("booking.submitted", { name: destData.name })}
                  </p>
                  <p className="text-sm text-muted mb-6">
                    {t("booking.contactSoon")}
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:brightness-110 transition-all"
                  >
                    {t("booking.done")}
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Destination Info */}
                  <div className={`flex gap-4 mb-6 p-4 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <img
                      src={destination.image}
                      alt={destData.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary">
                        {destData.name}
                      </h3>
                      <p className="text-sm text-muted">{destData.location}</p>
                      <p className="text-primary font-bold mt-1">
                        {destination.price}
                      </p>
                    </div>
                  </div>

                  {/* Form */}
                  <Formik
                    initialValues={{
                      name: "",
                      phone: "",
                      address: "",
                      date: "",
                      paymentMethod: "",
                    }}
                    validationSchema={BookingSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                      <Form className="space-y-4">
                        {/* Name */}
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-secondary mb-1"
                          >
                            {t("booking.fullName")}
                          </label>
                          <Field
                            id="name"
                            name="name"
                            type="text"
                            placeholder={t("booking.namePlaceholder")}
                            className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${isRTL ? 'text-right' : 'text-left'} ${
                              errors.name && touched.name
                                ? "border-red-400 focus:border-red-500"
                                : "border-gray-200 focus:border-primary"
                            }`}
                          />
                          {errors.name && touched.name && (
                            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-secondary mb-1"
                          >
                            {t("booking.phoneNumber")}
                          </label>
                          <Field
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder={t("booking.phonePlaceholder")}
                            className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${isRTL ? 'text-right' : 'text-left'} ${
                              errors.phone && touched.phone
                                ? "border-red-400 focus:border-red-500"
                                : "border-gray-200 focus:border-primary"
                            }`}
                          />
                          {errors.phone && touched.phone && (
                            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                          )}
                        </div>

                        {/* Address */}
                        <div>
                          <label
                            htmlFor="address"
                            className="block text-sm font-medium text-secondary mb-1"
                          >
                            {t("booking.address")}
                          </label>
                          <Field
                            as="textarea"
                            id="address"
                            name="address"
                            rows={2}
                            placeholder={t("booking.addressPlaceholder")}
                            className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors resize-none ${isRTL ? 'text-right' : 'text-left'} ${
                              errors.address && touched.address
                                ? "border-red-400 focus:border-red-500"
                                : "border-gray-200 focus:border-primary"
                            }`}
                          />
                          {errors.address && touched.address && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.address}
                            </p>
                          )}
                        </div>

                        {/* Date */}
                        <div>
                          <label
                            htmlFor="date"
                            className="block text-sm font-medium text-secondary mb-1"
                          >
                            {t("booking.tripDate")}
                          </label>
                          <Field
                            id="date"
                            name="date"
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${isRTL ? 'text-right' : 'text-left'} ${
                              errors.date && touched.date
                                ? "border-red-400 focus:border-red-500"
                                : "border-gray-200 focus:border-primary"
                            }`}
                          />
                          {errors.date && touched.date && (
                            <p className="mt-1 text-xs text-red-500">{errors.date}</p>
                          )}
                        </div>

                        {/* Payment Method */}
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-2">
                            {t("booking.paymentMethod")}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {PAYMENT_METHODS.map((method) => (
                              <button
                                key={method.id}
                                type="button"
                                onClick={() => setFieldValue("paymentMethod", method.id)}
                                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${
                                  values.paymentMethod === method.id
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <method.icon
                                  size={24}
                                  className={
                                    values.paymentMethod === method.id
                                      ? "text-primary"
                                      : "text-muted"
                                  }
                                />
                                <span
                                  className={`text-sm font-medium ${
                                    values.paymentMethod === method.id
                                      ? "text-primary"
                                      : "text-secondary"
                                  }`}
                                >
                                  {method.name}
                                </span>
                              </button>
                            ))}
                          </div>
                          {errors.paymentMethod && touched.paymentMethod && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.paymentMethod}
                            </p>
                          )}
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                          {isSubmitting ? t("booking.submitting") : t("booking.submit")}
                        </button>
                      </Form>
                    )}
                  </Formik>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
