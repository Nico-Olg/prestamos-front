export interface Cobrador {
    id: number;
    dni: number;
    nombreyApellido: string;
    tel: string;
    zona: number;
}

export interface Pago {
    id: number;
    fechaPago: string | null; // Usamos string porque viene como "YYYY-MM-DD" en JSON
    monto: number;
    formaPago: string;
    descripcion: string | null;
    nombreCliente: string;
    prestamoId: number;
    nombreProducto: string;  
    nroCuota: number;
}

// ✅ Clase para mapear datos desde JSON
export class PagosMapper {
    static fromJSON(json: any): { cobrador: Cobrador; pagos: Pago[] } {
        return {
            cobrador: {
                id: json.cobrador.id,
                dni: json.cobrador.dni,
                nombreyApellido: json.cobrador.nombreyApellido,
                tel: json.cobrador.tel,
                zona: json.cobrador.zona,
            },
            pagos: json.pagos.map((p: any) => ({
                id: p.id,
                fechaPago: p.fechaPago ?? null,
                monto: p.monto,
                formaPago: p.formaPago,
                descripcion: p.descripcion ?? null,
                nombreCliente: p.nombreCliente,
                prestamoId: p.prestamoId,
                producto: p.producto,
                cuotaNro: p.cuotaNro,
            })),
        };
    }
}
