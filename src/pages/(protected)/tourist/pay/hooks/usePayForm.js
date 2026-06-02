import * as Yup from "yup";
import { readBookingInfo, saveBookingInfo } from "../../../../../services/booking-session";

// Builds booking form defaults, validation, and submit navigation from one place.
export function usePayForm({ destId, navigate, t }) {
  const savedBookingInfo = readBookingInfo();

  const bookingSchema = Yup.object().shape({
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

  const submitBookingInfo = (values, { setSubmitting }) => {
    saveBookingInfo({ ...values, numberOfPeople: 1 });
    navigate(destId ? `/tourist/plans?destId=${destId}` : "/tourist/plans");
    setSubmitting(false);
  };

  return {
    bookingSchema,
    initialValues,
    submitBookingInfo,
  };
}
