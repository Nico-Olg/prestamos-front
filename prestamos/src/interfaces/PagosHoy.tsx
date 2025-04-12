export interface PagosHoy {
    id:          number;
    fechaPago:   Date;
    monto:       number;
    formaPago:   string;
    descripcion: null;
    cliente:     Cliente;
    prestamo:    Prestamo;
    producto:    string;
    cuotaNro:    number;
    montoAbonado?: number;
    diferencia?: number;
    

}

export interface Cliente {
    id:                  number;
    apellidoYnombre:     string;
    dni:                 number;
    fechaNac:            null;
    direccionComercial:  string;
    barrioComercial:     string;
    direccionParticular: string;
    barrioParticular:    string;
    tel:                 string;
    fechaAlta:           null;
    orden?:      number | null;
}

export interface Prestamo {
    id:                number;
    tipoPlan:          string;
    dias:              number;
    montoCuota:        number;
    total:             null;
    fechaInicio:       Date;
    fechaFinalizacion: Date;
    cuotasPagadas:     number;
    montoRestante:     null;
    activo:            boolean;
    periodoPago:       null;
    alDia:             boolean;
}