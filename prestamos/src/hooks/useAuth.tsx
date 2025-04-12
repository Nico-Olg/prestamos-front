import { useState, useEffect } from 'react';

const useAuth = () => {
    const [rol, setRol] = useState<string | null>(null);

    useEffect(() => {
        const storedRol = localStorage.getItem('rol');
        setRol(storedRol);
    }, []);

    return { rol };
};

export default useAuth;
