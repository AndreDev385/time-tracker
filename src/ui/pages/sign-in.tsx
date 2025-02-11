import React from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/shared/button";

export function SignInPage() {
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    window.electron.signInSubmit({
      email: String(data.email),
      password: String(data.password),
    });
  }

  React.useEffect(() => {
    window.electron.signInResult((path: string) => {
      console.log({ path })
      navigate(path)
    })
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
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
              className="w-full rounded-full font-semibold"
              name="intent"
              value="sing-in"
              type="submit"
            >
              Iniciar sesión
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
