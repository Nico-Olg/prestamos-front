import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, cobranzaDelDia } from "../apis/postApi";
import { useClientContext } from "../provider/ClientContext";
import { PagosMapper } from "../interfaces/Pagos";
import loadingGIF from "../assets/loading.gif";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Login.css";

const Login: React.FC = () => {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshClientes } = useClientContext();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      localStorage.clear();
      sessionStorage.clear();

      const token = await login(dni, password);
      localStorage.setItem("token", token);
      const rol = localStorage.getItem("rol");
      const id = localStorage.getItem("id");

      if (rol === "ADMIN") {
        await refreshClientes();
        navigate("/clientes");
      } else if (rol === "COBRADOR") {
        const today = new Date().toISOString().split("T")[0];
        const response = await cobranzaDelDia(Number(id), today);
        const data = PagosMapper.fromJSON(response);

        if (!data?.pagos || !data?.cobrador)
          throw new Error("Datos incompletos");
        sessionStorage.setItem("cobradorId", data.cobrador.id.toString());

        navigate("/pagos", {
          state: { pagos: data.pagos, cobrador: data.cobrador },
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Credenciales incorrectas. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page container-fluid d-flex align-items-center justify-content-center min-vh-100 bg-light">
      {isLoading && (
        <div className="loading-overlay">
          <img src={loadingGIF} alt="Cargando..." className="loading-gif" />
        </div>
      )}

      <div
        className="login-card p-4 shadow rounded-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className="mb-4 text-center fw-bold text-primary">Bienvenido</h2>

        <form onSubmit={handleLogin}>
          <div className="form-floating mb-3">
            <input
              type="text"
              id="dni"
              className="form-control"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
              disabled={isLoading}
              placeholder="DNI"
            />
            <label htmlFor="dni">DNI</label>
          </div>

          <div className="form-floating mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control pe-5"
              id="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <label htmlFor="password">Contraseña</label>

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2"
              onClick={() => setShowPassword(!showPassword)}
              style={{ zIndex: 5 }}
              tabIndex={-1}
            >
              <i
                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
              ></i>
            </button>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold rounded-pill"
            disabled={isLoading}
          >
            {isLoading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-3 text-center">
          <small className="text-muted">
            ¿Olvidaste tu contraseña?{" "}
            <span className="text-primary" style={{ cursor: "pointer" }}>
              Recuperar
            </span>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;
