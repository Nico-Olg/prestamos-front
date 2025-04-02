export interface Cliente {
    id:                  number;
    apellidoYnombre:     string;
    dni:                 number;
    fechaNac:            Date;
    direccionComercial:  string;
    barrioComercial:     string;
    direccionParticular: string;
    barrioParticular:    null | string;
    tel:                 string;
    tel2:                string | "";
    socio_conyugue:      null | string;
    fechaAlta:           Date;
    rubro:               string;
    orden:               number | null;
    cobrador_id:         number;
}
