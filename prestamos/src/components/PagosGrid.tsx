import React from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import '../styles/PagosGrid.css';

interface Pago {
  id: number;
  fechaPago: string | null;
  nombreProducto: string;
  descripcion: string | null;
  monto: number;
  formaPago: string;
  montoAbonado: number | null;
  nroCuota: number;
}

interface PagosGridProps {
  pagos: Pago[];
  handlePagoCuota: (pagoId: number, monto: number) => void;
}

const PagosGrid: React.FC<PagosGridProps> = ({ pagos, handlePagoCuota }) => {
  const columns: TableColumn<Pago>[] = [
    {
      name: 'Nro. Cuota',
      selector: (row) => row.nroCuota.toString(),
      sortable: true,
    },
    {
      name: 'Monto',
      selector: (row) => `$${row.monto.toFixed(2)}`,
      sortable: true,
    },
    {
      name: 'Fecha de Pago',
      selector: (row) => row.montoAbonado ? new Date(row.fechaPago || '').toLocaleDateString() : 'No pagado',
      sortable: true,
    },
    {
      name: 'Acción',
      cell: (row) =>
        row.montoAbonado ? (
          <span className="text-success">Cuota Pagada</span>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => handlePagoCuota(row.id, row.monto)}
          >
            Pagar
          </button>
        ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    
  ];

  return (
    <div className="pagos-grid">
      <DataTable
        columns={columns}
        data={pagos}
        pagination
        highlightOnHover
        paginationPerPage={10}
        paginationComponentOptions={{
          rowsPerPageText: 'Filas por página:',
          rangeSeparatorText: 'de',
        }}
      />
    </div>
  );
};

export default PagosGrid;
