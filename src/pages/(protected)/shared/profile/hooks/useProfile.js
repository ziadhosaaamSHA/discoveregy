import { useEffect, useState } from "react";
import * as Yup from "yup";
import { changePasswordApi, deleteMyAccountApi, updateMyProfileApi } from "../../../../../services/auth-api";
import { tourismApi } from "../../../../../services/tourism-api";

// Owns profile details loading, validation schemas, account updates, and destructive account actions.
export function useProfile({ user, updateUser, logout, navigate, t }) {
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [resolvedRole, setResolvedRole] = useState("");
  const [profileInitialValues, setProfileInitialValues] = useState({
    userName: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const profileSchema = Yup.object({
    userName: Yup.string().min(2, t("validation.nameMin2")).required(t("auth.nameRequired")),
    phoneNumber: Yup.string().matches(/^[0-9]{10,15}$/, t("validation.phoneInvalid")).required(t("auth.phoneRequired")),
  });

  const passwordSchema = Yup.object({
    currentPassword: Yup.string().required(t("auth.passwordRequired")),
    newPassword: Yup.string().min(6, t("auth.passwordMin6")).required(t("auth.passwordRequired")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], t("auth.passwordsMatch"))
      .required(t("auth.confirmRequired")),
  });

  useEffect(() => {
    let cancelled = false;

    const loadUserDetails = async () => {
      const userId = Number(user?.id);
      if (!Number.isFinite(userId)) return;

      try {
        const [response, roleResponse] = await Promise.all([
          tourismApi.getUserById(userId),
          tourismApi.getUserRoles(userId).catch(() => []),
        ]);
        const payload =
          response && typeof response === "object"
            ? (response.data && typeof response.data === "object" ? response.data : response)
            : null;
        if (!payload || cancelled) return;

        const resolvedName =
          payload.userName ||
          payload.name ||
          `${payload.firstName || ""} ${payload.lastName || ""}`.trim() ||
          user?.name ||
          "";
        const resolvedPhone = payload.phoneNumber || payload.phone || user?.phoneNumber || "";
        setProfileInitialValues({
          userName: resolvedName,
          phoneNumber: resolvedPhone,
        });

        const roles = Array.isArray(roleResponse)
          ? roleResponse
          : Array.isArray(roleResponse?.items)
            ? roleResponse.items
            : Array.isArray(roleResponse?.data)
              ? roleResponse.data
              : [];
        const normalizedRoles = roles
          .map((role) => String(role?.name || role || "").trim().toLowerCase())
          .filter(Boolean);
        const nextType = normalizedRoles.includes("guide")
          ? "guide"
          : normalizedRoles.includes("admin")
            ? "admin"
            : normalizedRoles.includes("tourist")
              ? "tourist"
              : user?.type;
        if (nextType && nextType !== user?.type) {
          updateUser({ ...user, type: nextType });
        }
        if (normalizedRoles.length > 0) {
          setResolvedRole(normalizedRoles[0][0].toUpperCase() + normalizedRoles[0].slice(1));
        } else {
          setResolvedRole("");
        }
      } catch {
        if (!cancelled) {
          setProfileInitialValues({
            userName: user?.name || "",
            phoneNumber: user?.phoneNumber || "",
          });
          setResolvedRole("");
        }
      }
    };

    loadUserDetails();
    return () => {
      cancelled = true;
    };
  }, [updateUser, user]);

  const updateProfile = async (values, { setSubmitting }) => {
    setError("");
    setProfileMessage("");
    try {
      await updateMyProfileApi(values);
      updateUser({ ...user, name: values.userName });
      setProfileMessage(t("auth.profileUpdated"));
    } catch (err) {
      setError(err?.message || t("auth.profileUpdateFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const changePassword = async (values, { setSubmitting, resetForm }) => {
    setError("");
    setPasswordMessage("");
    try {
      await changePasswordApi({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setPasswordMessage(t("auth.passwordChanged"));
      resetForm();
    } catch (err) {
      setError(err?.message || t("auth.passwordChangeFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAccount = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setError("");
    try {
      await deleteMyAccountApi();
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err?.message || t("auth.deleteAccountFailed"));
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  return {
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
  };
}
