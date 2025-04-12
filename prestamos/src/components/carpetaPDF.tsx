import jsPDF from "jspdf";
import "jspdf-autotable";
import { Cliente } from "../interfaces/Cliente";
import { Prestamo } from "../interfaces/Prestamo";
import { Pago } from "../interfaces/Pagos";
import logo from "../assets/logo_plan_cor.png";

const getBase64Image = (img: HTMLImageElement) => {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(img, 0, 0);
  return canvas.toDataURL("image/png");
};

const formatDate = (dateString: string) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return "Fecha no válida";
  }
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

export const generarPDF = (cliente: Cliente, prestamo: Prestamo, pagos: Pago[]) => {
  const doc = new jsPDF();
  const marginTop = 35;

  const nombreCompleto = cliente.apellidoYnombre ?? "Sin nombre";
  const direccion = cliente.direccionComercial ?? "Sin dirección";
  const barrio = cliente.barrioComercial ?? "Sin barrio";
  const cuotas = prestamo.cantidadPagos ?? 0;
  const montoCuota = prestamo.montoCuota ?? 0;
  const fechaFinalizacion = prestamo.fechaFinalizacion
    ? formatDate(prestamo.fechaFinalizacion.toString())
    : "Sin fecha";
  const producto = prestamo.producto ?? "Sin producto";

  const textY = marginTop + 5;

  doc.setFontSize(16);
  doc.text("CARPETA CONTROL", 105, marginTop, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Cliente: ${nombreCompleto}`, 20, textY);
  doc.text(`Codigo Cred: ${prestamo.idPrestamo}`, 160, textY);

  doc.text(`Plan Crédito: ${cuotas} X $${montoCuota.toFixed(2)}`, 20, textY + 10);
  doc.text(`Domicilio: ${direccion}`, 105, textY + 10);

  doc.text(`Fecha Finalizacion: ${fechaFinalizacion}`, 20, textY + 20);
  doc.text(`Barrio: ${barrio}`, 105, textY + 20);
  doc.text(`Producto: ${producto}`, 20, textY + 30);

  const addCuotas = () => {
    const pagosOrdenados = [...pagos].sort((a, b) => a.nroCuota - b.nroCuota);
    return pagosOrdenados.map((pago, i) => [
      (i + 1).toString(),
      formatDate(pago.fechaVencimiento.toString()),
      `$${pago.monto.toFixed(2)}`,
      ""
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

  (doc as any).autoTable(tableOptions).finalY || textY + 40;

  const pageHeight = doc.internal.pageSize.height;
  const footerY = pageHeight - 30;

  doc.setPage(doc.getNumberOfPages());
  doc.text(`Saldo:__________________`, 20, footerY);
  doc.text("Efectivo: __________________", 20, footerY + 10);
  doc.text(`Total crédito: __________________`, 20, footerY + 20);

  doc.text(`Plan: __________________`, 120, footerY);
  doc.text(`Inicio:__________________`, 120, footerY + 10);
  doc.text("Firma: ____________________", 120, footerY + 20);

  const img = new Image();
  img.src = logo;
  img.onload = () => {
    const logoBase64 = getBase64Image(img);

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.addImage(logoBase64, "PNG", 4, 4, 25, 25, undefined, 'FAST');
    }

    doc.save(`Carpeta_Control_${nombreCompleto}.pdf`);
  };
};
