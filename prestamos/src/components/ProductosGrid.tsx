import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { getProductos } from "../apis/getApi"; // Asegúrate de agregar esta función en tu getApi
import "../styles/ClientesGrid.css"; // Reutilizamos el mismo archivo de estilos de ClientesGrid


interface Producto {
    id: number;
    descripcion: string;
    valor: number;
    esDinero: boolean;
}

const ProductosGrid: React.FC = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [filterProductos, setFilteredProductos] = useState<Producto[]>([]);
    const [searchDescripcion, setSearchDescripcion] = useState<string>("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProductos = async () => {
            const productos = await getProductos();
            setProductos(productos);
            setFilteredProductos(productos);
        };
        fetchProductos();
    }, []);
     const handleSearchDescripcion = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^A-Za-z\s]/g, "");
    setSearchDescripcion(value);
    filterData(value);
  };
  const filterData = (descripcion: string) => {
    const filteredData = productos.filter(
      (producto) =>
        producto.descripcion.toLowerCase().includes(descripcion.toLowerCase())         
    );
    setFilteredProductos(filteredData);
  };

    const columns: TableColumn<Producto>[] = [
        {
            name: "ID",
            selector: (row) => row.id,
            sortable: true,
        },
        {
            name: "Descripción",
            selector: (row) => row.descripcion,
            sortable: true,
        },
        {
            name: "Valor",
            selector: (row) => row.valor,
            sortable: true,
        },
        {
            name: "Es dinero",
            selector: (row) => row.esDinero,
            sortable: true,
            cell: (row) => (row.esDinero ? "Sí" : "No"),
        },
    ];

    return (
      <div className="clientes-grid">
        <div className="group">
          <div className="buscarPornombre">
            <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
              <g>
                <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
              </g>
            </svg>
            <input
              type="search"
              placeholder="Buscar por nombre"
              value={searchDescripcion}
              onChange={handleSearchDescripcion}
              className="input"
            />
            <DataTable
              columns={columns}
              data={filterProductos}
              pagination
              highlightOnHover
              pointerOnHover
              onRowClicked={(row) => navigate(`/productos/${row.id}`)}
            />
            <div className="button-container">
              <button
                className="btn"
                onClick={() => navigate("/nuevo-producto")}
              >
                Nuevo Producto
              </button>
            </div>
          </div>
        </div>
      </div>
    );
};

export default ProductosGrid;