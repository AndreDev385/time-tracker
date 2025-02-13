import React from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/shared/button";
import { Loader2 } from "lucide-react";
import { LocalStorage } from "../storage";

export function SignInPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

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
      window.electron.checkToken().then((data) => {
        if (data.success) {
          LocalStorage().setItem("user", data.user);
          navigate("/session");
        }
      })
    }
  }, [navigate])

  React.useEffect(function signInResult() {
    window.electron.signInResult((data) => {
      setSubmitting(false);
      if (data.success) {
        setError("");
        LocalStorage().setItem("token", data.token);
        navigate("/session");
      } else {
        setError(data.error);
      }
    });
  }, [navigate])

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
