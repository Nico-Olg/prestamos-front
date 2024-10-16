export interface Cliente {
    id:                  number;
    apellidoYnombre:     string;
    dni:                 number;
    fechaNac:            Date;
    direccionComercial:  string;
    barrioComercial:     string;
    direccionParticular: string;
    barrioParticular:    string;
    tel:                 string;
    tel2?:               string | null;
    socio_conyugue?:     string | null;
    fechaAlta:           Date;
    rubro:               string;
    orden?:              number | null;
    prestamo:           Prestamo[];
    cobrador:            Cobrador;
   
}

export interface Pago {
    id:             number;
    fechaPago:      Date;
    nombreProducto: string;
    monto:          number;
    formaPago:      string;
    billetes?:      Billetes;
    descripcion?:   string | null;
    nroCuota:       number;
    montoAbonado:   number;
}
export interface Cobrador {
    id:   number;
    nombreyApellido: string;
    dni:  number;
    zona: number;
    tel:  string;

}
export enum NombreProducto {
    Efectivo = "Efectivo",
}

export interface Billetes {
    // Este objeto parece estar vacío, así que lo dejamos como tal
}

export interface Prestamo {
    id:                number;
    pagos:             Pago[];
    nombreProducto:    string;
    valorProducto?:    string | null;
    tipoPlan:          string;
    dias:              number;
    montoCuota:        number;
    total:             number;
    fechaInicio:       Date;
    fechaFinalizacion: Date;
    cuotasPagadas:     number;
    montoRestante?:    number | null;
    activo:            boolean;
    periodo_pago:      string;
    al_dia:            boolean;

      codigo: string; // Added property

  cuotas: number; // Added property

  producto: string; // Added property
}
