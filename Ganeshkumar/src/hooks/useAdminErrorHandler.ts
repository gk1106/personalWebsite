import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { AdminApiError } from "../services/adminBlogService";

/**
 * Normalizes a caught error into an AdminApiError. For an expired/invalid
 * session ("unauthorized"), it also clears auth and redirects to
 * /admin/login — the one place that side effect happens, so every admin
 * page gets it for free just by using this hook.
 */
export function useAdminErrorHandler() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useCallback(
    (err: unknown): AdminApiError => {
      const error = err instanceof AdminApiError ? err : new AdminApiError("unexpected", "Something went wrong.");
      if (error.kind === "unauthorized") {
        logout();
        navigate("/admin/login", { replace: true });
      }
      return error;
    },
    [logout, navigate],
  );
}
