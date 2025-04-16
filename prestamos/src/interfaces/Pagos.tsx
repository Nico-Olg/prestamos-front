export interface Cobrador {
    id: number;
    dni: number;
    nombreyApellido: string;
    tel: string;
    zona: number;
}

export interface Pago {
    id:               number;
    fechaVencimiento: Date;
    fechaPago:        Date | null;
    nombreProducto:   string;
    descripcion:      null;
    monto:            number;
    formaPago:        string;
    montoAbonado:     number | null;
    nroCuota:         number;
    diferencia:       number | null;
    billetes:         string | "";
    nombreCliente:    string;
    cantCuotas:      number;
    saldo:           number;
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
                nombreProducto: p.nombreProducto,
                nroCuota: p.nroCuota,
                montoAbonado: p.montoAbonado ?? null,
                cantCuotas: p.cantCuotas,
                saldo: p.saldo,
            })),
        };
    }
}
