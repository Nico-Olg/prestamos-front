import axios from "axios";

export async function getPrestamosPorCliente(dni: number) {
   try {
        const response = await axios.post(
            'http://localhost:8080/prestamos/prestamos-por-Cliente',
            { param: { dni } }, 
            {
                auth: {
                    username: 'admin', 
                    password: 'admin', 
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                 withCredentials: true,
            }
        );
        return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al obtener los clientes: ${error.response?.status} ${error.response?.statusText}`);
    } else {
      throw new Error('Error desconocido al obtener los clientes');
    }
  }
}
export async function getPagosPorPrestamo(prestamoId: number) {
    try {
        const response = await axios.post(
        'http://localhost:8080/pagos/obtener-pagos',
        { param: { id: prestamoId } },
        {
            auth: {
            username: 'admin',
            password: 'admin',
            },
            headers: {
            'Content-Type': 'application/json',
            },
            withCredentials: true,
        }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
        throw new Error(`Error al obtener los pagos: ${error.response?.status} ${error.response?.statusText}`);
        } else {
        throw new Error('Error desconocido al obtener los pagos');
        }
    }
}
export async function getClientebyDni(dni: number) {
    try {
        const response = await axios.post(
            `http://localhost:8080/clientes/buscar-dni`, 
            { dni }, // Envío del DNI directamente en el cuerpo de la solicitud
            {
                auth: {
                    username: 'admin',
                    password: 'admin',
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Error al obtener el cliente: ${error.response?.status} ${error.response?.statusText}`);
        } else {
            throw new Error('Error desconocido al obtener el cliente');
        }
    }
}
export async function crearPrestamo(
  cantidadCuotas: number,
  codigoProducto: number,
  dni_cliente: number,
  periodo_pago: string,
  montoPrestado: number,
  pagoEnEfectivo: boolean
) {
  try {
    const response = await axios.post(
      'http://localhost:8080/prestamos/crear-prestamo',
      {
        param: {
          cantidadCuotas,
          codigoProducto,
          dni_cliente,
          periodo_pago,
          montoPrestado,
          pagoEnEfectivo : pagoEnEfectivo ? true : false,
        },
      },
      {
        auth: {
          username: 'admin',
          password: 'admin',
        },
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al crear el préstamo: ${error.response?.status} ${error.response?.statusText}`);
    } else {
      throw new Error('Error desconocido al crear el préstamo');
    }
  }
}
export async function actualizarFechaInicio(
  prestamoId: number,
  fechaInicio: string,
) {
  try {
    const response = await axios.post(
      'http://localhost:8080/prestamos/actualizar-fechaInicio',
      {
        param: {
         prestamoId,
          fechaInicio,
        },
      },
      {
        auth: {
          username: 'admin',
          password: 'admin',
        },
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al actualizar la Fecha de Inicio: ${error.response?.status} ${error.response?.statusText}`);
    } else {
      throw new Error('Error desconocido al actualizar la Fecha de Inicio');
    }
  }
}


export async function eliminarPrestamo(prestamoId: number) {
    try {
        const response = await axios.delete(
            `http://localhost:8080/prestamos/borrar-prestamo/${prestamoId}`, // Corrección de la URL
            {
                auth: {
                    username: 'admin',
                    password: 'admin',
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            }
        );
        return response.status;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Error al eliminar el préstamo: ${error.response?.status} ${error.response?.statusText}`);
        } else {
            throw new Error('Error desconocido al eliminar el préstamo');
        }
    }
}
// export async function altaCliente(
//   nombre_y_apellido: string,
//   barrio_comercial: string,
//   dni: number,
//   barrio_particular: string,
//   tel: number,
//   direccion_comercial: string,
//   direccion_particular: string,
//   fecha_nac: string,
//   rubro: string,
//   tel2: string,
//   socio: string,
//   cobrador: number,
// ) {
//   try {
//     const response = await axios.post(
//       'http://localhost:8080/clientes/nuevo-cliente',
//       {
//         param: {
//           nombre_y_apellido,
//           barrio_comercial,
//           dni,
//           barrio_particular,
//           tel,          
//           tel2 : tel2 ? tel2 : null,
//           socio : socio ? socio : null,
//           cobrador : cobrador ? cobrador : null,
//           rubro,
//           direccion_comercial,
//           direccion_particular,
//           fecha_nac,
//         },
//       },
//       {
//         auth: {
//           username: 'admin',
//           password: 'admin',
//         },
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         withCredentials: true,
//       }
//     );
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       throw new Error(`Error al crear el préstamo: ${error.response?.status} ${error.response?.statusText}`);
//     } else {
//       throw new Error('Error desconocido al crear el préstamo');
//     }
//   }
// }
interface ClienteData {
  nombre_y_apellido: string;
  barrio_comercial: string;
  dni: number;
  barrio_particular: string;
  tel: number;
  direccion_comercial: string;
  direccion_particular: string;
  fecha_nac: string;
  rubro: string;
  tel2?: string;
  socio?: string;
  cobrador?: number;
}

export async function altaCliente(clienteData: ClienteData) {
  try {
    const response = await axios.post(
      'http://localhost:8080/clientes/nuevo-cliente',
      clienteData, // Envío de los datos del cliente directamente en el cuerpo de la solicitud
      {
        auth: {
          username: 'admin',
          password: 'admin',
        },
        
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al crear el cliente: ${error.response?.data} `);
    } else {
      throw new Error('Error desconocido al crear el cliente');
    }
  }
}





