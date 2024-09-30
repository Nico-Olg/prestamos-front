import React from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';

interface Pago {
  id: number;
  cliente: {
    nombre: string;
    dni: number;
  };
  monto: number;
  fechaPago: string;
  atrasado: boolean; // Atributo que indica si el pago está atrasado
}

interface PagosGridProps {
  pagos: Pago[];
  handlePagoCuota: (pagoId: number, atrasado: boolean) => void;
}

const PagosGrid: React.FC<PagosGridProps> = ({ pagos, handlePagoCuota }) => {
  const columns: TableColumn<Pago>[] = [
    {
      name: 'Cliente',
      selector: (row) => row.cliente.nombre,
      sortable: true,
    },
    {
      name: 'DNI',
      selector: (row) => row.cliente.dni.toString(),
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

  return <DataTable columns={columns} data={pagos} pagination />;
};

export default PagosGrid;
