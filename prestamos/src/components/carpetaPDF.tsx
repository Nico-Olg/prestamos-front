import jsPDF from "jspdf";
import "jspdf-autotable";
import { Cliente, Prestamo } from "../interfaces/Cliente";

// Función para generar el PDF
export const generarPDF = (cliente: Cliente, prestamo: Prestamo) => {
  const doc = new jsPDF();

  // Utiliza valores predeterminados si los valores son null o undefined
  const nombreCompleto = cliente.apellidoYnombre ?? "Sin nombre";
  const direccion = cliente.direccionComercial ?? "Sin dirección";
  const barrio = cliente.barrioComercial ?? "Sin barrio";
  const codigo = prestamo.codigo?.toString() ?? "Sin código";
  const cuotas = prestamo.pagos.length ?? 0;
  const montoCuota = prestamo.montoCuota ?? 0;

  // Verificamos si `fechaInicio` es una instancia de `Date`, de lo contrario la convertimos
  let fechaInicio = "Sin fecha";
  if (prestamo.fechaInicio) {
    const fechaInicioDate = new Date(prestamo.fechaInicio); // Convertimos a Date
    if (!isNaN(fechaInicioDate.getTime())) {
      fechaInicio = fechaInicioDate.toLocaleDateString();
    }
  }

  const producto = prestamo.producto ?? "Sin producto";

  const textY = 40;

  // Título del documento
  doc.setFontSize(16);
  doc.text("CARPETA CONTROL", 105, 20, { align: "center" });

  // Información del cliente y préstamo
  doc.setFontSize(12);
  doc.text(`Cliente: ${nombreCompleto}`, 20, textY);
  doc.text(`Codigo Cred: ${prestamo.id}`, 160, textY);

  doc.text(`Plan Crédito: ${cuotas} X $${montoCuota.toFixed(2)}`, 20, textY + 10);
  doc.text(`Domicilio: ${direccion}`, 105, textY + 10);

  doc.text(`Fecha Inicio: ${fechaInicio}`, 20, textY + 20);
  doc.text(`Barrio: ${barrio}`, 105, textY + 20);
  doc.text(`Producto: ${producto}`, 20, textY + 30);

  // Generar la tabla de cuotas con fechas de vencimiento basadas en los pagos
  const addCuotas = () => {
    return prestamo.pagos.map((pago, i) => [
      (i + 1).toString(), // Número de cuota
      new Date(pago.fechaPago).toLocaleDateString(), // Fecha de pago convertida a Date
      `$${pago.monto.toFixed(2)}`,  // Monto del pago
      "",  // Espacio para la firma
    ]);
  };

  const tableOptions = {
    head: [["Cuota Nro", "Fecha Venc", "Monto", "Firma"]],
    body: addCuotas(),
    startY: textY + 40,
    theme: "grid",
    styles: {
      halign: "center",
      valign: "middle",
    },
  };

  // Generar la tabla de cuotas
  const finalY = (doc as any).autoTable(tableOptions).finalY || textY + 40;

  // Manejar valores indefinidos o nulos en las siguientes líneas
  const saldo = prestamo.montoRestante !== undefined && prestamo.montoRestante !== null
    ? `$${prestamo.montoRestante.toFixed(2)}`
    : "No disponible";
  const totalCredito = prestamo.total !== undefined && prestamo.total !== null
    ? `$${prestamo.total.toFixed(2)}`
    : "No disponible";
  const tipoPlan = prestamo.tipoPlan ?? "No disponible";
  const inicio = prestamo.fechaInicio ?? "No disponible";

  // Verificar si hay suficiente espacio en la página para la información adicional
  if (finalY + 60 > doc.internal.pageSize.height) {
    doc.addPage(); // Agregar una nueva página si no hay suficiente espacio
  }

  // Información adicional después de la tabla
  doc.text(`Saldo: ${saldo}`, 20, finalY + 20);
  doc.text("Efectivo: __________________", 20, finalY + 30);
  doc.text(`Total crédito: ${totalCredito}`, 20, finalY + 40);

  doc.text(`Plan: ${tipoPlan}`, 120, finalY + 20);
  doc.text(`Inicio: ${inicio}`, 120, finalY + 30);
  doc.text("Firma: ____________________", 120, finalY + 40);

  // Descargar el PDF
  doc.save(`Carpeta_Control_${nombreCompleto}.pdf`);
};
