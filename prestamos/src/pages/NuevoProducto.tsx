import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/AltaUsuario.css';
import { altaProducto } from '../apis/postApi';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Producto {
    descripcion: string;
    valor: number;
    esDinero: boolean;
}

const NuevoProducto: React.FC = () => {
    const [producto, setProducto] = useState<Producto>({
        descripcion: '',
        valor: 0,
        esDinero: false
    });
    const navigate = useNavigate();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = event.target;

        // Si el input es de tipo checkbox, actualizar el estado correctamente
        if (type === "checkbox") {
            setProducto(prevState => ({ ...prevState, [name]: checked }));
        } else {
            setProducto(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await altaProducto(producto);
            toast.success('Producto creado con éxito!');
            setTimeout(() => {
                navigate('/productos');
            }, 3000);
        } catch (error: any) {
            toast.error('Error al crear el producto');
        }
    };

    return (
        <div className="nuevo-producto-page">
            <Header title="Nuevo Producto" />
            <div className="content">
                <Sidebar />
                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="descripcion">Descripción</label>
                            <input
                                type="text"
                                id="descripcion"
                                name="descripcion"
                                value={producto.descripcion}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="valor">Valor</label>
                            <input
                                type="number"
                                id="valor"
                                name="valor"
                                value={producto.valor}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="esDinero">Es dinero</label>
                            <input
                                type="checkbox"
                                id="esDinero"
                                name="esDinero"
                                checked={producto.esDinero} // Aquí controlamos el valor del checkbox
                                onChange={handleChange}
                            />
                        </div>
                        <button type="submit">Crear Producto</button>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default NuevoProducto;
