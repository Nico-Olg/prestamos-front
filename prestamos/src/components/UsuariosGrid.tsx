import { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cambiarPassword, eliminarUsuario } from "../apis/postApi";
import "../styles/PrestamosGrid.css";



// Definir la interfaz para los datos de los préstamos
interface Usuario {
  id?: number;
  dni: number | null;
  nombre: string;
  rol: string;
}

interface UsuariosGridProps {
  usuarios: Usuario[];
  onRecargar?: () => void;
}

const UsuariosGrid: React.FC<UsuariosGridProps> = ({ usuarios, onRecargar }) => {

  const navigate = useNavigate();

  const esAdmin = localStorage.getItem("rol") === "ADMIN";

  // Id del usuario logueado (guardado en el login) para impedir el auto-borrado
  const idUsuarioActual = Number(localStorage.getItem("id"));

  // No mostrar renglones vacíos (usuarios sin nombre ni dni)
  const usuariosValidos = usuarios.filter(
    (u) => (u.nombre && u.nombre.trim() !== "") || u.dni != null
  );

  // Estado para el modal de cambio de clave
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarPassword2, setMostrarPassword2] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Estado para el modal de confirmación de eliminación
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const abrirModal = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setPassword("");
    setPassword2("");
    setMostrarPassword(false);
    setMostrarPassword2(false);
  };

  const cerrarModal = () => {
    setUsuarioSeleccionado(null);
    setPassword("");
    setPassword2("");
    setMostrarPassword(false);
    setMostrarPassword2(false);
  };

  const handleCambiarClave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!usuarioSeleccionado || usuarioSeleccionado.dni == null) {
      toast.error("El usuario no tiene un DNI válido");
      return;
    }
    if (password !== password2) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      setGuardando(true);
      await cambiarPassword(usuarioSeleccionado.dni, password);
      toast.success(`Clave actualizada para ${usuarioSeleccionado.nombre}`);
      cerrarModal();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (usuario: Usuario) => {
    navigate("/alta-usuario", { state: { usuario } });
  };

  const confirmarEliminar = async () => {
    if (!usuarioAEliminar || usuarioAEliminar.id == null) {
      toast.error("El usuario no tiene un id válido");
      return;
    }
    if (usuarioAEliminar.id === idUsuarioActual) {
      toast.error("No podés eliminar tu propio usuario");
      return;
    }

    try {
      setEliminando(true);
      await eliminarUsuario(usuarioAEliminar.id);
      toast.success(`Usuario ${usuarioAEliminar.nombre} eliminado`);
      setUsuarioAEliminar(null);
      onRecargar?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setEliminando(false);
    }
  };

  const columns: TableColumn<Usuario>[] = [
    {
      name: "Nombre",
      selector: (row) => row.nombre ?? "",
      sortable: true,
    },
    {
      name: "DNI",
      selector: (row) => (row.dni != null ? row.dni.toString() : "-"),
      sortable: true,
    },
    {
      name: "Rol",
      selector: (row) => row.rol ?? "",
      sortable: true,
    },
  ];

  if (esAdmin) {
    columns.push({
      name: "Acciones",
      cell: (row) => (
        <div className="acciones">
          <button
            className="icon-btn"
            onClick={() => handleEditar(row)}
            title="Editar usuario"
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="icon-btn"
            onClick={() => abrirModal(row)}
            disabled={row.dni == null}
            title={row.dni == null ? "El usuario no tiene DNI" : "Cambiar clave"}
          >
            <i className="bi bi-key"></i>
          </button>
          <button
            className="icon-btn danger"
            onClick={() => setUsuarioAEliminar(row)}
            disabled={row.id == null || row.id === idUsuarioActual}
            title={row.id === idUsuarioActual ? "No podés eliminar tu propio usuario" : "Eliminar usuario"}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
      ignoreRowClick: true,
      minWidth: "160px",
    });
  }

  return (
    <div className="prestamos-grid usuarios-grid">

      <DataTable
        columns={columns}
        data={usuariosValidos}
        pagination
        highlightOnHover

      />
       <div className="button-container">
          <button className="action-btn" onClick={() => navigate("/alta-usuario")}>
            Nuevo Usuario
          </button>
        </div>

      {usuarioSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cambiar clave de {usuarioSeleccionado.nombre}</h3>
            <form onSubmit={handleCambiarClave}>
              <div className="form-group">
                <label htmlFor="nuevaPassword">Nueva Contraseña</label>
                <div className="password-wrapper">
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    id="nuevaPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    title={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    tabIndex={-1}
                  >
                    <i className={mostrarPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="nuevaPassword2">Repetir Contraseña</label>
                <div className="password-wrapper">
                  <input
                    type={mostrarPassword2 ? "text" : "password"}
                    id="nuevaPassword2"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setMostrarPassword2(!mostrarPassword2)}
                    title={mostrarPassword2 ? "Ocultar contraseña" : "Mostrar contraseña"}
                    tabIndex={-1}
                  >
                    <i className={mostrarPassword2 ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </button>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="action-btn cancel-btn" onClick={cerrarModal} disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className="action-btn" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {usuarioAEliminar && (
        <div className="modal-overlay" onClick={() => setUsuarioAEliminar(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar usuario</h3>
            <p>
              ¿Estás seguro de que querés eliminar a <strong>{usuarioAEliminar.nombre}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="action-btn cancel-btn"
                onClick={() => setUsuarioAEliminar(null)}
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="action-btn danger-btn"
                onClick={confirmarEliminar}
                disabled={eliminando}
              >
                {eliminando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default UsuariosGrid;
