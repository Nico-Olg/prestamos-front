export const formatearNumero = (numero: number) => {
  return new Intl.NumberFormat('es-AR').format(numero);
};
