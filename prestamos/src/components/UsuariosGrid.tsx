import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import "../styles/PrestamosGrid.css";



// Definir la interfaz para los datos de los préstamos
interface Usuario {
 dni: number;
    nombre: string;
    rol: string; 
}

interface UsuariosGridProps {
  usuarios: Usuario[];
}

const UsuariosGrid: React.FC<UsuariosGridProps> = ({ usuarios }) => {
  
  const navigate = useNavigate();  
 
  const columns: TableColumn<Usuario>[] = [
    {
      name: "Nombre",
      selector: (row) => row.nombre,
      sortable: true,
    },
    {
      name: "DNI",
      selector: (row) => row.dni.toString(),
      sortable: true,
    },
    {
      name: "Rol",
      selector: (row) => row.rol,
      sortable: true,
    },
    ];

  return (
    <div className="prestamos-grid">
      
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

    </div>
  );
};

export default UsuariosGrid;
