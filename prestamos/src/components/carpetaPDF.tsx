import jsPDF from "jspdf";
import "jspdf-autotable";
import { Cliente, Prestamo } from "../interfaces/Cliente";
import logo from "../assets/logo_plan_cor.png"; // Importa la imagen del logo

// Función para convertir una imagen a base64
const getBase64Image = (img: HTMLImageElement) => {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(img, 0, 0);
  return canvas.toDataURL("image/png");
};

// Función para generar el PDF
export const generarPDF = (cliente: Cliente, prestamo: Prestamo) => {
  const doc = new jsPDF();
  const marginTop = 35; // Ajusta este margen para evitar que el contenido se superponga con el logo

  // Utiliza valores predeterminados si los valores son null o undefined
  const nombreCompleto = cliente.apellidoYnombre ?? "Sin nombre";
  const direccion = cliente.direccionComercial ?? "Sin dirección";
  const barrio = cliente.barrioComercial ?? "Sin barrio";
  const cuotas = prestamo.pagos.length ?? 0;
  const montoCuota = prestamo.montoCuota ?? 0;

  // Verificamos si `fechaInicio` es una instancia de `Date`, de lo contrario la convertimos
  let fechaFinalizacion = "Sin fecha";
  if (prestamo.fechaFinalizacion) {
    const fechaFinalizacionDate = new Date(prestamo.fechaFinalizacion); // Convertimos a Date
    if (!isNaN(fechaFinalizacionDate.getTime())) {
      fechaFinalizacion = fechaFinalizacionDate.toLocaleDateString();
    }
  }

  const producto = prestamo.producto ?? "Sin producto";

  const textY = marginTop + 5;

  // Título del documento
  doc.setFontSize(16);
  doc.text("CARPETA CONTROL", 105, marginTop, { align: "center" });

  // Información del cliente y préstamo
  doc.setFontSize(12);
  doc.text(`Cliente: ${nombreCompleto}`, 20, textY);
  doc.text(`Codigo Cred: ${prestamo.id}`, 160, textY);

  doc.text(`Plan Crédito: ${cuotas} X $${montoCuota.toFixed(2)}`, 20, textY + 10);
  doc.text(`Domicilio: ${direccion}`, 105, textY + 10);

  doc.text(`Fecha Finalizacion: ${fechaFinalizacion}`, 20, textY + 20);
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
  (doc as any).autoTable(tableOptions).finalY || textY + 40;

  // Manejar valores indefinidos o nulos en las siguientes líneas
  const saldo = prestamo.montoRestante !== undefined && prestamo.montoRestante !== null
    ? `$${prestamo.montoRestante.toFixed(2)}`
    : "No disponible";
  const totalCredito = prestamo.total !== undefined && prestamo.total !== null
    ? `$${prestamo.total.toFixed(2)}`
    : "No disponible";
  const tipoPlan = prestamo.tipoPlan ?? "No disponible";
  const inicio = prestamo.fechaInicio ?? "No disponible";

  // Calcular la posición del pie de página
  const pageHeight = doc.internal.pageSize.height;
  const footerY = pageHeight - 30; // Ajusta este valor según sea necesario

  // Agregar la información adicional al pie de la última página
  doc.setPage(doc.getNumberOfPages()); // Ir a la última página
  doc.text(`Saldo: ${saldo}`, 20, footerY);
  doc.text("Efectivo: __________________", 20, footerY + 10);
  doc.text(`Total crédito: ${totalCredito}`, 20, footerY + 20);

  doc.text(`Plan: ${tipoPlan}`, 120, footerY);
  doc.text(`Inicio: ${inicio}`, 120, footerY + 10);
  doc.text("Firma: ____________________", 120, footerY + 20);

  // Cargar la imagen del logo y convertirla a base64
  const img = new Image();
  img.src = logo;
  img.onload = () => {
    const logoBase64 = getBase64Image(img);

    // Agregar la imagen de fondo en cada página
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      // Agrega el logo en la parte superior izquierda de cada página
      doc.addImage(logoBase64, "PNG", 4, 4, 25, 25, undefined, 'FAST');
    }

    // Descargar el PDF
    doc.save(`Carpeta_Control_${nombreCompleto}.pdf`);
  };
};
