import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/PrestamosGrid.css";

// Definir la interfaz para los datos de los préstamos
interface Prestamo {
  apellidoYnombre: string;
  dni: number;
  tel: string;
  producto: string;
  cuotasPagadas: number;
  montoCuota: number;
  montoRestante: number;
  montoPrestamo: number;
  tipoPlan: string;
  fechaInicio: string;
  fechaFinalizacion: string;
  al_dia: boolean;
  periodo_pago: string;
}

const CreditoCliente: React.FC = (cliente) => {
    return (
        <div>
            <h1>cliente.dni</h1>
        </div>
    );

//   const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
//   const [filteredPrestamos, setFilteredPrestamos] = useState<Prestamo[]>([]);
//   const [searchName, setSearchName] = useState<string>("");
//   const [searchDNI, setSearchDNI] = useState<string>("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchPrestamos = async () => {
//       try {

//       }
       
//         );
//         setPrestamos(response.data);
//         setFilteredPrestamos(response.data);
//       } catch (error) {
//         console.log("Error fetching prestamos: ", error);
//       }
//     };

//     fetchPrestamos();
//   }, []);

//   const handleSearchName = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const value = event.target.value.replace(/[^A-Za-z\s]/g, ""); // Eliminar cualquier carácter que no sea una letra o espacio
//     setSearchName(value);
//     filterData(value, searchDNI);
//   };

//   const handleSearchDNI = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const value = event.target.value.replace(/\D/g, ""); // Eliminar cualquier carácter que no sea un número
//     setSearchDNI(value);
//     filterData(searchName, value);
//   };

//   const filterData = (name: string, dni: string) => {
//     const filteredData = prestamos.filter(
//       (prestamo) =>
//         prestamo.apellidoYnombre.toLowerCase().includes(name.toLowerCase()) &&
//         (dni === "" || (prestamo.dni && prestamo.dni.toString().startsWith(dni)))
//     );

//     setFilteredPrestamos(filteredData);
//   };

//   const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
//     return (
//       <div className="progress-bar-container">
//         <div className="progress-bar" style={{ width: `${percentage}%` }}>
//           {percentage}%
//         </div>
//       </div>
//     );
//   };

//   const columns: TableColumn<Prestamo>[] = [
//     {
//       name: "Nombre",
//       selector: (row) => row.apellidoYnombre,
//       sortable: true,
//     },
//     {
//       name: "DNI",
//       selector: (row) => row.dni.toString(),
//       sortable: true,
//     },
//     {
//       name: "Teléfono",
//       selector: (row) => row.tel,
//       sortable: true,
//     },
//     {
//       name: "Producto",
//       selector: (row) => row.producto,
//       sortable: true,
//     },
//     {
//       name: "Cuotas Pagadas",
//       selector: (row) => row.cuotasPagadas.toString(),
//       sortable: true,
//     },
//     {
//       name: "Cuota",
//       selector: (row) => "$ " + row.montoCuota.toFixed(2),
//       sortable: true,
//     },
//     {
//       name: "Monto Restante",
//       selector: (row) => "$ " + row.montoRestante.toFixed(2),
//       sortable: true,
//     },
//     {
//       name: "Monto Prestamo",
//       selector: (row) => "$ " + row.montoPrestamo.toFixed(2),
//       sortable: true,
//     },
//     {
//       name: "Tipo de Plan",
//       selector: (row) => row.tipoPlan,
//       sortable: true,
//     },
//     {
//       name: "Fecha de Inicio",
//       selector: (row) => row.fechaInicio,
//       sortable: true,
//     },
//     {
//       name: "Fecha de Finalización",
//       selector: (row) => row.fechaFinalizacion,
//       sortable: true,
//     },
//     {
//       name: "Al Día",
//       selector: (row) => (row.al_dia ? "Sí" : "No"),
//       sortable: true,
//     },
//     {
//       name: "Periodo Pago",
//       selector: (row) => row.periodo_pago,
//       sortable: true,
//     },
//     {
//       name: "Avance",
//       cell: (row) => {
//         const percentage = Math.ceil(
//           (row.cuotasPagadas * row.montoCuota * 100) / row.montoPrestamo
//         );
//         return <ProgressBar percentage={percentage} />;
//       },
//       sortable: true,
//     },
//   ];

//   return (
//     <div className="prestamos-grid">
//       <div className="group">
//         <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
//           <g>
//             <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
//           </g>
//         </svg>
//         <input
//           type="search"
//           placeholder="Buscar por nombre"
//           value={searchName}
//           onChange={handleSearchName}
//           className="input"
//         />
//         <input
//           type="search"
//           placeholder="Buscar por DNI"
//           value={searchDNI}
//           onChange={handleSearchDNI}
//           className="input"
//         />
//       </div>

//       <DataTable
//         columns={columns}
//         data={filteredPrestamos}
//         pagination
//         highlightOnHover
//       />
//       <div className="button-container">
//         <button className="btn" onClick={() => navigate("/alta-cliente")}>
//           Añadir Cliente
//         </button>
//       </div>
//     </div>
//   );
};

export default CreditoCliente;
