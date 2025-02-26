import axios from "axios";
import API_BASE_URL from './config'; // Importa la URL base

// Obtener el token JWT del localStorage
function getAuthToken() {
  return localStorage.getItem('token');
}
function getUserRole() {
  return localStorage.getItem('rol'); // Obtiene el rol almacenado en el login
}


export async function getAllClients() {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/clientes/findAll`, {
      headers: {
        'Authorization': `Bearer ${token}`, // Agregar el token en el header
      },
      withCredentials: true,
    });

    return response.data; // Devolver los datos de los clientes
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al obtener los clientes: ${error.response?.status} ${error.response?.statusText}`);
    } else {
      throw new Error('Error desconocido al obtener los clientes');
    }
  }
}

export async function getPrestamosPorCliente() {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/prestamos/activos`, {
      headers: {
        'Authorization': `Bearer ${token}`, // Agregar el token en el header
      },
      withCredentials: true,
    });

    return response.data; // Devolver los datos de los préstamos activos
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al obtener los préstamos: ${error.response?.status} ${error.response?.statusText}`);
    } else {
      throw new Error('Error desconocido al obtener los préstamos');
    }
  }
}

export async function getProductos() {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/productos/ver-todos`, {
      headers: {
        'Authorization': `Bearer ${token}`, // Agregar el token en el header
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al obtener los productos: ${error.response?.status} ${error.response?.statusText}`);
    } else {
      throw new Error('Error desconocido al obtener los productos');
    }
  }
}

export async function getCobradores() {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/cobradores/findAll`, {
      headers: {
        'Authorization': `Bearer ${token}`, // Agregar el token en el header
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al obtener los cobradores: ${error.response?.status} ${error.response?.statusText}`);
    } else {
      throw new Error('Error desconocido al obtener los cobradores');
    }
  }
}

export async function getClientesPorCobrador(cobradorId: number) {
  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${API_BASE_URL}/cobradores/${cobradorId}/clientes`,
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
      throw new Error(`Error al obtener los clientes: ${error.response?.status} ${error.response?.statusText}`);
    } else {
      throw new Error('Error desconocido al obtener los clientes');
    }
  }
}
export async function getPagosDeHoy() {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/pagos/pagos-hoy`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching pagos de hoy: ", error);
    throw error;
  }
}
export async function getUsuarios() {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/usuarios/usuarios`, {
      headers: {
        'Authorization': `Bearer ${token}`, // Agregar el token en el header
      },
      withCredentials: true,
    });
    return response.data;
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error al obtener los usuarios: ${error.response?.status} ${error.response?.statusText}`);
    } else {
      throw new Error('Error desconocido al obtener los usuarios');
    }
  }
}


