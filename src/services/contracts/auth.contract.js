import { z } from "zod";
import { parseWithSchema } from "./common.contract";

// Auth role values can arrive as backend enum casing or frontend lowercase casing.
export const userRoleSchema = z.enum(["tourist", "guide", "admin", "Tourist", "Guide", "Admin"]);

// Login is strict because the backend requires both email and password.
export const loginRequestSchema = z.object({
  email: z.email().max(100),
  password: z.string().min(1),
});

// Social login varies by provider, so only the shared fields are documented.
export const socialLoginRequestSchema = z
  .object({
    token: z.string().nullable().optional(),
    provider: z.string().nullable().optional(),
  })
  .passthrough();

// Reset password allows nullable fields because the backend DTO marks them nullable.
export const resetPasswordRequestSchema = z
  .object({
    email: z.string().nullable().optional(),
    otp: z.string().nullable().optional(),
    newPassword: z.string().nullable().optional(),
  })
  .passthrough();

// Update profile is permissive because current UI sends userName while OpenAPI also lists first/last name.
export const updateUserRequestSchema = z
  .object({
    firstName: z.string().max(50).nullable().optional(),
    lastName: z.string().max(50).nullable().optional(),
    userName: z.string().nullable().optional(),
    phoneNumber: z.string().nullable().optional(),
    image: z.unknown().optional(),
  })
  .passthrough();

// confirmNewPassword is filled by the service for older call sites that only send newPassword.
export const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmNewPassword: z.string().min(1).optional(),
  })
  .passthrough();

// User profile responses are normalized by auth.mapper after this flexible shape check.
export const userProfileSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    userId: z.union([z.string(), z.number()]).optional(),
    userID: z.union([z.string(), z.number()]).optional(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    fullName: z.string().nullable().optional(),
    displayName: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    userName: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    role: z.union([z.string(), z.array(z.string())]).nullable().optional(),
    userRole: z.union([z.string(), z.array(z.string())]).nullable().optional(),
    type: z.string().nullable().optional(),
  })
  .passthrough();

// Auth responses may return tokens directly or inside a user/profile envelope.
export const authResponseSchema = z
  .object({
    accessToken: z.string().nullable().optional(),
    token: z.string().nullable().optional(),
    jwt: z.string().nullable().optional(),
    access_token: z.string().nullable().optional(),
    refreshToken: z.string().nullable().optional(),
    refresh_token: z.string().nullable().optional(),
    user: userProfileSchema.optional(),
    profile: userProfileSchema.optional(),
  })
  .passthrough();

/** Validates the login request body before it reaches /api/auth/login. */
export function validateLoginRequest(payload) {
  return parseWithSchema(loginRequestSchema, payload, "Login request");
}

/** Validates a social-login request while allowing provider-specific additions. */
export function validateSocialLoginRequest(payload) {
  return parseWithSchema(socialLoginRequestSchema, payload, "Social login request");
}

/** Validates the reset-password request body. */
export function validateResetPasswordRequest(payload) {
  return parseWithSchema(resetPasswordRequestSchema, payload, "Reset password request");
}

/** Validates profile update payloads while preserving backend-compatible extras. */
export function validateUpdateUserRequest(payload) {
  return parseWithSchema(updateUserRequestSchema, payload, "Update profile request");
}

/** Validates change-password payloads and enforces backend password length rules. */
export function validateChangePasswordRequest(payload) {
  return parseWithSchema(changePasswordRequestSchema, payload, "Change password request");
}

/** Validates and returns the flexible auth response envelope. */
export function parseAuthPayload(payload) {
  return parseWithSchema(authResponseSchema, payload || {}, "Auth response");
}

/** Validates and returns a flexible user profile response. */
export function parseUserProfile(payload) {
  return parseWithSchema(userProfileSchema, payload || {}, "User profile response");
}
