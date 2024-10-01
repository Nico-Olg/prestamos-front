import axios from "axios";
import API_BASE_URL from './config'; // Importa la URL base

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
      `${API_BASE_URL}/pagos/obtener-pagos`,
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
  dni: number;
  barrioParticular: string;
  tel: number;
  direccionComercial: string;
  direccionParticular: string;
  fechaNac: string;
  rubro: string;
  tel2?: string;
  socio?: string;
  cobrador?: number;
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

    const { token } = response.data;

    if (token) {
      localStorage.setItem('token', token); // Almacena el token en localStorage
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
export async function registrarPago(pagoId: number) {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/pagos/registrar/${pagoId}`,
      {}, // Puedes enviar un cuerpo vacío si no necesitas otros parámetros
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


