import { useState } from 'react';
import styles from '../styles.module.css';
import { useSignup } from '../../../hooks/useSignup';

const RegistrationForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const { signUp, error, isLoading } = useSignup();

    const handleSignUp = async (e) => {
        e.preventDefault();
        console.log(username, email, password);

        await signUp(username, email, password);
        console.log('regForm: ', error);
    };

    return (
        <form className={`${styles.container} bg-grey-800 flex-col gap-3 align-items-center w-100 pad-4`}>
            <div className={`${styles.intro} flex-col gap-3 align-items-center text-grey-50 w-100`}>
                <h3>
                    <b className="font-size-4" data-testid="signup-title">
                        <span className="text-turquoise-500">Sign Up </span>Now
                    </b>
                </h3>
                <p className="font-size-2">
                    Guess what. It's just as Ez.
                </p>
            </div>
            <div className={`${styles.content} flex-col justify-content-center align-items-center text-grey-50`}>
                <label className="flex-col justify-content-start gap-2 marb-1 w-100">
                    <p>Username: </p>
                    <input className="font-size-2 pad-2 radius-2 w-100" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"></input>
                </label>
                <label className="flex-col justify-content-start gap-2 marb-1 w-100">
                    <p>Email: </p>
                    <input className="font-size-2 pad-2 radius-2 w-100" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="amazingyou@example.com"></input>
                </label>
                <label className="flex-col justify-content-start gap-2 w-100">
                    <p>Password: </p>{' '}
                    <input className="font-size-2 pad-2 radius-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)}></input>
                </label>
                <p className="font-size-1">
                    Password must be at least 8 characters long, contain a number and a special character (?!@#$%&)
                </p>
                {/* <label>Confirm password: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}></input></label> */}
            </div>
            {error && <div className={`errorMessage ${styles.smallErrorMessage}`}>{error}</div>}
            <button className={` ${styles.signInBtn} fill-button font-size-2 bg-blue-500 pady-2 padx-3 radius-2 font-weight-700 text-grey-50 w-100`} disabled={isLoading} onClick={handleSignUp}>
                Sign Up
            </button>
        </form>
    );
};

export default RegistrationForm;
