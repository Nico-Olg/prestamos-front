export interface Prestamo {
    apellidoYnombre:   string;
    tel:               string;
    dni:               number;
    cuotasPagadas:     number;
    montoCuota:        number;
    montoRestante:     number;
    tipoPlan:          string;
    activo:            boolean;
    al_dia:            boolean;
    fechaInicio:       Date;
    fechaFinalizacion: Date ;
    montoPrestamo:     number;
    idPrestamo:        number;
    producto:          string;
    periodo_pago:      string;
    cantidadPagos:     number;
    efectividad:          number;
    montoPrestado:   number;
}