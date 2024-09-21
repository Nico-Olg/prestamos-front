import axios from "axios";

export async function getAllClients() {
  const username = "admin";
  const password = "admin";

  try {
    const response = await axios.get("http://localhost:8080/clientes/findAll", {
      auth: {
        username,
        password,
      },
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

// Nueva función para obtener préstamos activos
export async function getPrestamosPorCliente() {
  const username = "admin";
  const password = "admin";

  try {
    const response = await axios.get("http://localhost:8080/prestamos/activos", {
      auth: {
        username,
        password,
      },
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
  const username = "admin";
  const password = "admin";
  try {
    const response = await axios.get("http://localhost:8080/productos/ver-todos", {
      auth: {
        username,
        password,
      },     
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
  const username = "admin";
  const password = "admin";
  try {
    const response = await axios.get("http://localhost:8080/cobradores/findAll", {
      auth: {
        username,
        password,
      },     
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