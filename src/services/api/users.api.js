import { apiRequest } from "../api-client";
import { validateAssignRoleRequest, validateRejectGuideRequest } from "../contracts";

/**
 * User endpoints include profile administration and guide approval workflows.
 * Current-user self-service actions live in profile.api.js.
 */
export const usersApi = {
  // Admin list of all users.
  getUsers: () => apiRequest("/api/users", { cache: true, cacheTTL: 5 * 60 * 1000 }),
  // Public/consumer list of approved guides.
  getGuides: () => apiRequest("/api/users/guides", { cache: true, cacheTTL: 5 * 60 * 1000 }),
  // Admin list of all guides regardless of status.
  getAllGuides: () => apiRequest("/api/users/guides/all"),
  // Admin list of guide applications awaiting approval.
  getPendingGuides: () => apiRequest("/api/users/guides/pending"),
  // Approves a pending guide.
  approveGuide: (id) => apiRequest(`/api/users/guides/${id}/approve`, { method: "PUT" }),
  // Rejects a pending guide with a required reason.
  rejectGuide: (id, payload) =>
    apiRequest(`/api/users/guides/${id}/reject`, { method: "PUT", body: validateRejectGuideRequest(payload) }),
  // Suspends an active guide.
  suspendGuide: (id) => apiRequest(`/api/users/guides/${id}/suspend`, { method: "PUT" }),
  // Loads one user by id.
  getUserById: (id) => apiRequest(`/api/users/${id}`),
  // Deletes one user by id.
  deleteUserById: (id) => apiRequest(`/api/users/${id}`, { method: "DELETE" }),
  // Loads roles assigned to one user.
  getUserRoles: (id) => apiRequest(`/api/users/${id}/roles`),
  // Assigns a role to one user.
  assignUserRole: (id, role) =>
    apiRequest(`/api/users/${id}/assign-role`, {
      method: "POST",
      body: validateAssignRoleRequest({ roleName: role }),
    }),
  // Removes a role from one user.
  removeUserRole: (id, role) =>
    apiRequest(`/api/users/${id}/remove-role`, {
      method: "DELETE",
      body: validateAssignRoleRequest({ roleName: role }),
    }),
  // Loads reward/loyalty points for the current user.
  getUserPoints: () => apiRequest("/api/users/points"),
};
