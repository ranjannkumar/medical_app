import { useContext } from 'react';
import { AuthContext } from '../AuthContext'; // Import AuthContext

// Custom hook to consume the AuthContext
const useAuth = () => {
    return useContext(AuthContext);
};

export default useAuth;

