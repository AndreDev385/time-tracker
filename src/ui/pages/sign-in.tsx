import React from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/shared/button";
import { Loader2 } from "lucide-react";
import { LocalStorage } from "../storage";
import { ROUTES } from "../main";

export function SignInPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    window.electron.signInSubmit({
      email: String(data.email),
      password: String(data.password),
    });
  }

  React.useEffect(function checkToken() {
    const token = LocalStorage().getItem("token");
    if (token) {
      setLoading(true);
      window.electron.checkToken().then((data) => {
        if (data.success) {
          LocalStorage().setItem("user", data.user);
          navigate(ROUTES.journey);
        }
      }).finally(() => {
        setLoading(false);
      })
    }
  }, [navigate])

  React.useEffect(function signInResult() {
    return window.electron.signInResult((data) => {
      setSubmitting(false);
      if (data.success) {
        setError("");
        LocalStorage().setItem("token", data.token);
        window.electron.checkToken().then((data) => {
          if (data.success) {
            LocalStorage().setItem("user", data.user);
            navigate(ROUTES.journey);
          } else {
            setError("Error al iniciar sesión")
          }
        })
      } else {
        setError(data.error);
      }
    });
    return unsubscribe
  }, [navigate])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="p-8 w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
          <em className="text-red-500">{error}</em>
          <div className="mb-4">
            <label className="font-bold" htmlFor="email">Correo</label>
            <input
              required
              type="email"
              name="email"
              placeholder="john@doe.com"
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label className="font-bold" htmlFor="email">Contraseña</label>
            <input
              required
              type="password"
              name="password"
              placeholder="******"
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end">
            <Button
              disabled={submitting}
              className="w-full rounded-lg font-semibold"
              name="intent"
              value="sing-in"
              type="submit"
            >
              {submitting ? (
                <>
                  Iniciando... <Loader2 className="animate-spin ml-2" />
                </>
              ) :
                "Iniciar sesión"
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
