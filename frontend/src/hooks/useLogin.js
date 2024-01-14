import { useState } from 'react';
import { useAuthContext } from './useAuthContext';

const useLogin = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { dispatch, ACTION } = useAuthContext();

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);

        const userObj = { email, password };
        // console.log(JSON.stringify(userObj))

        try {
            const response = await fetch('https://ezcoms.onrender.com/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userObj)
            });

            const user = await response.json();

            if (!response.ok) {
                setIsLoading(false);
                setError(user.error);
                // console.log('here: ', user.error);
            }

            if (response.ok) {
                // saving user to local storage
                localStorage.setItem('user', JSON.stringify(user));

                // update to auth context
                dispatch({ type: ACTION.LOGIN, payload: user });
                setIsLoading(false);
            }
        } catch (err) {
            setError(err);
            setIsLoading(false);
        }
    };
    return { login, isLoading, error };
};

export { useLogin };
