import { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cambiarPassword } from "../apis/postApi";
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
}

const UsuariosGrid: React.FC<UsuariosGridProps> = ({ usuarios }) => {

  const navigate = useNavigate();

  const esAdmin = localStorage.getItem("rol") === "ADMIN";

  // Estado para el modal de cambio de clave
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [guardando, setGuardando] = useState(false);

  const abrirModal = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setPassword("");
    setPassword2("");
  };

  const cerrarModal = () => {
    setUsuarioSeleccionado(null);
    setPassword("");
    setPassword2("");
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
        <button
          className="action-btn"
          onClick={() => abrirModal(row)}
          disabled={row.dni == null}
          title={row.dni == null ? "El usuario no tiene DNI" : "Cambiar clave"}
        >
          Cambiar Clave
        </button>
      ),
      ignoreRowClick: true,
    });
  }

  return (
    <div className="prestamos-grid usuarios-grid">

      <DataTable
        columns={columns}
        data={usuarios}
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
                <input
                  type="password"
                  id="nuevaPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="nuevaPassword2">Repetir Contraseña</label>
                <input
                  type="password"
                  id="nuevaPassword2"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                />
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

      <ToastContainer />
    </div>
  );
};

export default UsuariosGrid;
