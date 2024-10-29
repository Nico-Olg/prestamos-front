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
  pagos.sort((a, b) => a.nroCuota - b.nroCuota);

  const columns: TableColumn<Pago>[] = [
    {
      name: 'Nro. Cuota',
      selector: (row) => row.nroCuota.toString(),
    },
    {
      name: 'Monto Cuota',
      selector: (row) => `$${row.monto.toFixed(2)}`,
    },
    {
      name: 'Monto Abonado',
      selector: (row) => (row.montoAbonado ? `$${row.montoAbonado.toFixed(2)}` : 'No pagado'),
    },
    {
      name: 'Diferencia',
      selector: (row) =>
        row.montoAbonado ? `$${(row.monto - row.montoAbonado).toFixed(2)}` : 'No pagado',
    },
    {
      name: 'Fecha de Pago',
      selector: (row) =>
        row.montoAbonado ? new Date(row.fechaPago || '').toLocaleDateString() : 'No pagado',
    },
    {
      name: 'Acción',
      cell: (row) => {
        const diferencia = row.montoAbonado ? row.monto - row.montoAbonado : row.monto;

        if (diferencia === 0 && row.montoAbonado === row.monto) {
          return <span className="text-success">Cuota Pagada</span>;
        } else if (diferencia < 0) {
          return <span className="text-success">Cuota Pagada</span>;
        } else if (diferencia > 0 && row.montoAbonado) {
          return (
            <button
              className="btn btn-warning"
              onClick={() => handlePagoCuota(row.id, diferencia)}
            >
              Completar Cuota
            </button>
          );
        } else {
          return (
            <button
              className="btn btn-primary"
              onClick={() => handlePagoCuota(row.id, row.monto)}
            >
              Pagar
            </button>
          );
        }
      },
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
        conditionalRowStyles={[
          {
            when: (row: Pago) => row.montoAbonado !== null && row.monto > row.montoAbonado,
            style: {
              backgroundColor: '#ffeb99', // Color para filas con diferencia
            },
          },
        ]}
      />
    </div>
  );
};

export default PagosGrid;
