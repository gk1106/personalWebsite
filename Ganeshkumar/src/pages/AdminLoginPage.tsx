import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { GlassPanel } from "../components/ui/GlassPanel";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { AuthError } from "../services/authService";

interface LoginLocationState {
  from?: { pathname: string };
}

export function AdminLoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useDocumentMeta({ title: "Admin Sign In — GaneshKumar (GK)" });

  if (isAuthenticated) {
    const state = location.state as LoginLocationState | null;
    return <Navigate to={state?.from?.pathname ?? "/admin"} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-5 py-16">
      <Container narrow className="max-w-md">
        <GlassPanel className="flex flex-col gap-6 p-8">
          <div className="flex flex-col gap-2 text-center">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Admin</span>
            <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
            <p className="text-sm text-muted-foreground">Manage blog posts for GaneshKumar (GK).</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm text-foreground"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting} className="mt-2 w-full">
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </GlassPanel>
      </Container>
    </div>
  );
}
