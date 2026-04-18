import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { X, CheckCircle, CreditCard, Smartphone } from "lucide-react";

const BookingSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10,15}$/, "Enter a valid phone number")
    .required("Phone number is required"),
  address: Yup.string()
    .min(10, "Please enter a complete address")
    .required("Address is required"),
  date: Yup.date()
    .min(new Date(), "Date must be in the future")
    .required("Date is required"),
  paymentMethod: Yup.string()
    .oneOf(["instapay", "vodafone_cash"], "Select a payment method")
    .required("Payment method is required"),
});

const PAYMENT_METHODS = [
  {
    id: "instapay",
    name: "InstaPay",
    icon: CreditCard,
    description: "Pay via InstaPay",
  },
  {
    id: "vodafone_cash",
    name: "Vodafone Cash",
    icon: Smartphone,
    description: "Pay via Vodafone Cash",
  },
];

export default function BookingModal({ isOpen, onClose, destination }) {
  const [isSubmitted, setIsSubmitted] = useState(false);

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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-secondary">
                {isSubmitted ? "Booking Confirmed!" : "Book Your Trip"}
              </h2>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
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
                    Thank You!
                  </h3>
                  <p className="text-muted mb-2">
                    Your booking request for{" "}
                    <span className="font-semibold text-secondary">
                      {destination.name}
                    </span>{" "}
                    has been submitted.
                  </p>
                  <p className="text-sm text-muted mb-6">
                    We will contact you shortly to confirm your reservation.
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:brightness-110 transition-all"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Destination Info */}
                  <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-secondary">
                        {destination.name}
                      </h3>
                      <p className="text-sm text-muted">{destination.location}</p>
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
                            Full Name
                          </label>
                          <Field
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
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
                            Phone Number
                          </label>
                          <Field
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="01xxxxxxxxx"
                            className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
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
                            Address
                          </label>
                          <Field
                            as="textarea"
                            id="address"
                            name="address"
                            rows={2}
                            placeholder="Enter your full address"
                            className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors resize-none ${
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
                            Trip Date
                          </label>
                          <Field
                            id="date"
                            name="date"
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
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
                            Payment Method
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
                          {isSubmitting ? "Submitting..." : "Submit Booking Request"}
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
