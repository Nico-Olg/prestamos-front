import axios from "axios";
import API_BASE_URL from './config'; // Importa la URL base
import { Cliente } from "../interfaces/Cliente";


// Obtener el token JWT del localStorage
function getAuthToken() {
  return localStorage.getItem('token');
}



export async function getPrestamosPorCliente(dni: number) {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/prestamos/prestamos-por-Cliente`,
      { param: { dni } },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Agregar el token en el header
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
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/pagos/por/prestamo`,
      { param: { id: prestamoId } },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Agregar el token en el header
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
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/clientes/buscar-dni`,
      { dni },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Agregar el token en el header
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
  pagoEnEfectivo: boolean,
  fechaInicio: string,
  fechaFin: string

) {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/prestamos/crear-prestamo`,
      {
        param: {
          cantidadCuotas,
          codigoProducto,
          dni_cliente,
          periodo_pago,
          montoPrestado,
          pagoEnEfectivo: pagoEnEfectivo ? true : false,
          fechaInicio,
          fechaFin
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Agregar el token en el header
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

export async function actualizarFechaInicio(prestamoId: number, fechaInicio: string) {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/prestamos/actualizar-fechaInicio`,
      {
        param: {
          prestamoId,
          fechaInicio,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Agregar el token en el header
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
    const token = getAuthToken();
    const response = await axios.delete(
      `${API_BASE_URL}/prestamos/borrar-prestamo/${prestamoId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Agregar el token en el header
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
interface ClienteData {
  apellidoYnombre: string;
  barrio_comercial: string;
  barrioComercial: string;
  dni: number;
  barrioParticular: string;
  tel: string;
  direccionComercial: string;
  direccionParticular: string;
  fechaNac: string;
  rubro: string;
  tel2?: string;
  socio?: string;
  cobrador :{
    id: number; 
  }
}


export async function altaCliente(clienteData: ClienteData) {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/clientes/nuevo-cliente`,
      clienteData,
      {
        headers: {
          'Authorization': `Bearer ${token}`, // Agregar el token en el header
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al crear el cliente: ${error.response?.data}`);
    } else {
      throw new Error('Error desconocido al crear el cliente');
    }
  }
}


export async function login(dni: string, password: string) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/usuarios/login`,
      { dni, password },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );

    const { token, usuario } = response.data;
    
    

    if (token) {
      localStorage.setItem('token', token); // Almacena el token en localStorage
    }
    if (usuario) {
      localStorage.setItem('rol', usuario.rol); // Almacena el rol en localStorage
      localStorage.setItem('id', usuario.id.toString()); // Almacena el id en localStorage
      localStorage.setItem('nombre', usuario.nombre); 

    }

    return token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error en el login: ${error.response?.status} ${error.response?.statusText}`);
    } else {
      throw new Error('Error desconocido en el login');
    }
  }
}
export async function registrarPago(id: number, monto: number) {
 
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/prestamos/pagar-cuota`,
      { id, monto },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al registrar el pago: ${error.response?.status} ${error.response?.statusText}`);
    } else {
      throw new Error('Error desconocido al registrar el pago');
    }
  }
}

export async function nuevoUsuario(usuarioData: { nombre: string, dni: number, rol: string, password: string }) {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/usuarios/nuevo-usuario`,
      usuarioData,
      {
        headers: {
          'Authorization': `Bearer ${token}`, // Agregar el token en el header
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al crear el usuario: ${error.response?.data}`);
    } else {
      throw new Error('Error desconocido al crear el usuario');
    }
  }
}

export async function altaCobrador(cobradorData: {
  nombreyApellido: string;
  dni: number;
  zona: number;
  tel: string;
}) {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/cobradores/nuevo-cobrador`,
      cobradorData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al crear el cobrador: ${error.response?.data}`);
    } else {
      throw new Error('Error desconocido al crear el cobrador');
    }
  }
}
export function altaProducto(producto: { descripcion: string, valor: number, esDinero: boolean }) {
  try {
    const token = getAuthToken();
    const response = axios.post(
      `${API_BASE_URL}/productos/agregar-producto`,
      producto,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al crear el producto: ${error.response?.data}`);
    } else {
      throw new Error('Error desconocido al crear el producto');
    }
  }
}
export function modificarCuotas(  monto_cuota: number, prestamoId: number ) {
  try {
    const token = getAuthToken();
    const response = axios.post(
      `${API_BASE_URL}/prestamos/modificar-valor-cuota`,
      {monto_cuota,
      prestamoId,},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al modificar las cuotas: ${error.response?.data}`);
    } else {
      throw new Error('Error desconocido al modificar las cuotas');
    }
  }
}

export async function guardarOrdenClientes(cobradorId: number, clientes: Cliente[]) {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/cobradores/${cobradorId}/guardar-orden-clientes`,
      clientes,  // Enviar la lista de clientes con el campo de orden actualizado
      {
        headers: {
          'Authorization': `Bearer ${token}`, // Agregar el token en el header
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al guardar el orden de los clientes: ${error.response?.data}`);
    } else {
      throw new Error('Error desconocido al guardar el orden de los clientes');
    }
  }
}

export async function editarCliente(cliente: Cliente) {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/clientes/editar-cliente`,
      cliente,
      {
        headers: {
          'Authorization': `Bearer ${token}`, // Agregar el token en el header
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al editar el cliente: ${error.response?.data}`);
    } else {
      throw new Error('Error desconocido al editar el cliente');
    }
  } 
}
export async function cobranzaDelDia(cobrador_id: number, fecha: string) {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/pagos/pagos-hoy`,
      { cobrador_id, fecha },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Agregar el token en el header
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al obtener la cobranza del día: ${error.response?.status} ${error.response?.statusText}`);
    } else {
      throw new Error('Error desconocido al obtener la cobranza del día');
    }
  }
}


export async function borrarCreditos(prestamo_id: number) {
  try {
    const token = getAuthToken();
    const response = await axios.delete(
      `${API_BASE_URL}/prestamos/borrar-prestamo`,
      {
        data: { prestamo_id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Agregar el token en el header
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al borrar los créditos: ${error.response?.status} ${error.response?.statusText}`);
    } else {
      throw new Error('Error desconocido al borrar los créditos');
    }
  }
}



