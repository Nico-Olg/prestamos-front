import React from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import '../styles/PagosGrid.css';

interface Pago {
  id: number;
  monto: number;
  fechaPago: string;
  atrasado: boolean;
  formaPago: string;
  producto: string | null;
  billetes: {};
  nroCuota: number;
}

interface PagosGridProps {
  pagos: Pago[];
  handlePagoCuota: (pagoId: number, atrasado: boolean) => void;
}

const PagosGrid: React.FC<PagosGridProps> = ({ pagos, handlePagoCuota }) => {
  const columns: TableColumn<Pago>[] = [
    {
      name: 'Nro. Cuota',
      selector: (row) => row.nroCuota,
      sortable: true,
    },
    {
      name: 'Monto',
      selector: (row) => `$${row.monto.toFixed(2)}`,
      sortable: true,
    },
    {
      name: 'Fecha de Pago',
      selector: (row) => row.fechaPago,
      sortable: true,
    },
    {
      name: 'Acción',
      cell: (row) => (
        <button
          className="btn btn-primary"
          onClick={() => handlePagoCuota(row.id, row.atrasado)}
        >
          Pagar
        </button>
      ),
    },
  ];

  return (
    <div className="pagos-grid">
      <DataTable
        columns={columns}
        data={pagos}
        pagination
        paginationPerPage={10} // Configura la cantidad de filas por página
        highlightOnHover
        customStyles={customStyles} // Aplica los estilos personalizados
        paginationComponentOptions={{
          rowsPerPageText: 'Filas por página:',
          rangeSeparatorText: 'de',
        }}
      />
    </div>
  );
};

export default PagosGrid;

const customStyles = {
  rows: {
    style: {
      minHeight: '50px', // Define la altura mínima de las filas
    },
  },
  headCells: {
    style: {
      backgroundColor: '#848b91', // Color del encabezado
      color: '#fff',
      fontWeight: 'bold',
    },
  },
  cells: {
    style: {
      padding: '10px', // Padding para las celdas
    },
  },
};
