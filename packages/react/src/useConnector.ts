import { useContext } from 'react';
import SecretariumContext from './SecretariumContext';

export const useConnector = () => {
    const { connector } = useContext(SecretariumContext);
    return connector;
};

export default useConnector;