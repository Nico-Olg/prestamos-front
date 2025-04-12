import Swal from "sweetalert2";

const useAlert = () => {
  const showSuccess = (title: string, text?: string, callback?: () => void) => {
    Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Aceptar",
    }).then(() => {
      if (callback) callback();
    });
  };

  const showError = (title: string, text?: string) => {
    Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonColor: "#d33",
      confirmButtonText: "Cerrar",
    });
  };

  const showWarning = (title: string, text?: string, confirmCallback?: () => void) => {
    Swal.fire({
      icon: "warning",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f39c12",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed && confirmCallback) {
        confirmCallback();
      }
    });
  };

  return { showSuccess, showError, showWarning };
};

export default useAlert;
