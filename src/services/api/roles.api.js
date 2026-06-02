import { apiRequest } from "../api-client";
import { validateCreateRoleRequest } from "../contracts";

/**
 * Role endpoints manage backend role records.
 * Assigning/removing roles from users lives in users.api.js.
 */
export const rolesApi = {
  // Loads all backend role records.
  getRoles: () => apiRequest("/api/roles"),
  // Creates a backend role record.
  createRole: (payload) => apiRequest("/api/roles", { method: "POST", body: validateCreateRoleRequest(payload) }),
  // Deletes a backend role record.
  deleteRole: (id) => apiRequest(`/api/roles/${id}`, { method: "DELETE" }),
};
