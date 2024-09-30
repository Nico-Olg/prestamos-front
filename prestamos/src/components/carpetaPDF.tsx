import jsPDF from "jspdf";
import "jspdf-autotable";

interface Cliente {
  nombreCompleto: string | null;
  direccion: string | null;
  barrio: string | null;
}

interface Prestamo {
  codigo: string | null;
  cuotas: number | null;
  montoCuota: number | null;
  fechaInicio: string | null;
  producto: string | null;
}

// Función para generar el PDF
export const generarPDF = (cliente: Cliente, prestamo: Prestamo) => {
  const doc = new jsPDF();

  // Utiliza valores predeterminados si los valores son null o undefined
  const nombreCompleto = cliente.nombreCompleto ?? "Sin nombre";
  const direccion = cliente.direccion ?? "Sin dirección";
  const barrio = cliente.barrio ?? "Sin barrio";
  const codigo = prestamo.codigo ?? "Sin código";
  const cuotas = prestamo.cuotas ?? 0;
  const montoCuota = prestamo.montoCuota ?? 0;
  const fechaInicio = prestamo.fechaInicio ?? "Sin fecha";
  const producto = prestamo.producto ?? "Sin producto";

  // Asegúrate de que las coordenadas X e Y sean números
  const textY = 40;

  // Título del documento
  doc.setFontSize(16);
  doc.text("CARPETA CONTROL", 105, 20, { align: "center" });

  // Información del cliente y préstamo
  doc.setFontSize(12);

  // Evitar posiciones indefinidas y errores con datos null
  doc.text(`Cliente: ${nombreCompleto}`, 20, textY);
  doc.text(`Código: ${codigo}`, 160, textY);

  doc.text(`Plan Crédito: ${cuotas} X $${montoCuota.toFixed(2)}`, 20, textY + 10);
  doc.text(`Domicilio: ${direccion}`, 105, textY + 10);

  doc.text(`Fecha Inicio: ${fechaInicio}`, 20, textY + 20);
  doc.text(`Barrio: ${barrio}`, 105, textY + 20);
  doc.text(`Producto: ${producto}`, 20, textY + 30);

  // Generar la tabla de cuotas
  const bodyRows = Array.from({ length: cuotas }, (_, index) => [
    (index + 1).toString(),
    "", // Columna de Fecha (vacía)
    "", // Columna de Monto (vacía)
    "", // Columna de Firma (vacía)
  ]);

  const tableOptions = {
    head: [["Cuotas", "Fecha", "Monto", "Firma"]],
    body: bodyRows,
    startY: textY + 40, // Ajusta la posición Y de inicio de la tabla
    theme: "grid",
    styles: {
      halign: "center",
      valign: "middle",
    },
  };

  // Generar la tabla y obtener la posición final Y
  const finalY = (doc as any).autoTable(tableOptions).finalY || textY + 40;

  // Información adicional (Saldo, Efectivo, Total crédito, etc.)
  doc.text("Saldo: ____________________", 20, finalY + 20);
  doc.text("Efectivo: __________________", 20, finalY + 30);
  doc.text("Total crédito: ______________", 20, finalY + 40);

  doc.text("Plan: _____________________", 120, finalY + 20);
  doc.text("Inicio: ____________________", 120, finalY + 30);
  doc.text("Firma: ____________________", 120, finalY + 40);

  // Descargar el PDF
  doc.save(`Carpeta_Control_${nombreCompleto}.pdf`);
};
