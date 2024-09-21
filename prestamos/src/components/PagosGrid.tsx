import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/ClientesGrid.css";

interface Pago {
  id: number;
  descripcion: string;
  fechaPago: string;
  formaPago: string;
  monto: number;
  cliente: {
    apellidoYnombre: string;
    dni: string;
    fechaNac: string;
    direccionComercial: string;
    barrioComercial: string;
    direccionParticular: string;
    barrioParticular: string;
    tel: string;
    fechaAlta: string;
  };
  prestamo: {
    fecha_finalizacion: string;
    tipo_plan: string;
  };
  producto: {
    descripcion: string;
  };
}

interface PagosGridProps {
  setTotalIngresos: (ingresos: number) => void;
  setTotalEgresos: (egresos: number) => void;
  pagos: Pago[]; // Recibe los pagos desde PagosPage
}

const PagosGrid: React.FC<PagosGridProps> = ({ setTotalIngresos, setTotalEgresos, pagos }) => {
  const [filteredPagos, setFilteredPagos] = useState<Pago[]>(pagos);
  const [searchName, setSearchName] = useState<string>("");
  const [searchDNI, setSearchDNI] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    setFilteredPagos(pagos); // Actualiza los pagos filtrados cuando se reciben nuevos datos
  }, [pagos]);

  const handleSearchName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^A-Za-z\s]/g, "");
    setSearchName(value);
    filterData(value, searchDNI, startDate, endDate);
  };

  const handleSearchDNI = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, "");
    setSearchDNI(value);
    filterData(searchName, value, startDate, endDate);
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      filterData(searchName, searchDNI, date, endDate);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    filterData(searchName, searchDNI, startDate, date);
  };

  const filterData = (
    name: string,
    dni: string,
    startDate: Date,
    endDate: Date | null
  ) => {
    let ingresos = 0;
    let egresos = 0;
    const filteredData = pagos.filter((pago) => {
      const matchesName = pago.cliente.apellidoYnombre
        .toLowerCase()
        .includes(name.toLowerCase());
      const matchesDNI =
        dni === "" || pago.cliente.dni.toString().startsWith(dni);

      const pagoDate = new Date(pago.fechaPago);
      const matchesDate =
        (!startDate || pagoDate >= startDate) &&
        (!endDate || pagoDate <= endDate);

      if (matchesDate) {
        if (pago.monto > 0) {
          ingresos += pago.monto;
        } else if (pago.monto < 0) {
          egresos += pago.monto;
        }
      }

      return matchesName && matchesDNI && matchesDate;
    });

    setFilteredPagos(filteredData);
    setTotalIngresos(ingresos);
    setTotalEgresos(egresos);
  };

  const columns: TableColumn<Pago>[] = [
    {
      name: "Nombre",
      selector: (row) => row.cliente?.apellidoYnombre || "N/A",
      sortable: true,
    },
    {
      name: "DNI",
      selector: (row) => row.cliente?.dni || "N/A",
      sortable: true,
    },
    {
      name: "Teléfono",
      selector: (row) => row.cliente?.tel || "N/A",
      sortable: true,
    },
    {
      name: "Fecha de Pago",
      selector: (row) => row.fechaPago || "N/A",
      sortable: true,
    },
    {
      name: "Monto",
      selector: (row) => `$ ${row.monto?.toFixed(2) || "0.00"}`,
      sortable: true,
    },
    {
      name: "Forma de Pago",
      selector: (row) => row.formaPago || "N/A",
      sortable: true,
    },
    {
      name: "Descripción",
      selector: (row) => row.descripcion || "N/A",
      sortable: true,
    },
  ];

  return (
    <div className="clientes-grid">
      <div className="group">
        <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
          <g>
            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
          </g>
        </svg>
        <input
          type="search"
          placeholder="Buscar por nombre"
          value={searchName}
          onChange={handleSearchName}
          className="input"
        />
        <input
          type="search"
          placeholder="Buscar por DNI"
          value={searchDNI}
          onChange={handleSearchDNI}
          className="input"
        />

        <DatePicker
          selected={startDate}
          onChange={handleStartDateChange}
          dateFormat="yyyy-MM-dd"
          className="fechas"
          placeholderText="Fecha desde"
        />
        <DatePicker
          selected={endDate}
          onChange={handleEndDateChange}
          dateFormat="yyyy-MM-dd"
          className="fechas"
          placeholderText="Fecha hasta"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredPagos}
        pagination
        highlightOnHover
        className="datatable"
      />
    </div>
  );
};

export default PagosGrid;
