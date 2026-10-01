import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

/** Single source of truth for "log out and go to the login page" — used by the admin header and dashboard alike. */
export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return () => {
    logout();
    navigate("/admin/login", { replace: true });
  };
}
