
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://prestamosapp-25bee6474d38.herokuapp.com' // URL de producción
  : 'http://localhost:8080'; // URL local

export default API_BASE_URL;
