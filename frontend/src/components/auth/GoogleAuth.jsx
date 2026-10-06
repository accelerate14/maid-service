import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function GoogleAuth({ 
    mode = 'signIn', // Accepts 'signIn' or 'signUp'
    phoneNumber, 
    address, 
    lat, 
    lng 
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { googleAuth } = useAuth();

    const isSignUp = mode === 'signUp';

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);

            if (!result?.user) {
                throw new Error('Google did not return a signed-in user.');
            }

            const idToken = await result.user.getIdToken();

            const payload = isSignUp
                ? {
                    idToken,
                    phone: phoneNumber,
                    address: address,
                    address_lat: lat,
                    address_lng: lng,
                  }
                : { idToken };

            const authResult = await googleAuth(payload);
            if (!authResult.success) {
                setError(authResult.error || 'Google authentication failed.');
            }
        } catch (error) {
            console.error('Error during Google authentication:', error);
            setError(error.message || 'Google authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {error && (
                <p role="alert" className="text-sm text-red-600 text-center">
                    {error}
                </p>
            )}
            <Button
                fullWidth
                onClick={handleGoogleAuth}
                variant="outline"
                isLoading={loading}
                disabled={loading}
            >
                <span className="inline-flex items-center justify-center gap-2">
                    <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.65 5.93c4.46-4.12 7.13-10.18 7.13-17.58Z" />
                        <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.55 2.56 10.78l7.97-6.19Z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.87l-7.65-5.93c-2.13 1.43-4.86 2.28-8.25 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
                    </svg>
                    {loading ? 'Connecting...' : `${isSignUp ? 'Sign up' : 'Sign in'} with Google`}
                </span>
            </Button>
        </>
    );
}