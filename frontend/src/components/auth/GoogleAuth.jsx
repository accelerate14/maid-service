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
    const { googleAuth } = useAuth();

    const isSignUp = mode === 'signUp';

    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            if (!result?.user) return;

            const payload = isSignUp
                ? {
                    name: result.user.displayName,
                    email: result.user.email,
                    phone: phoneNumber,
                    address: address,
                    address_lat: lat,
                    address_lng: lng,
                  }
                : { email: result.user.email };

            const user = await googleAuth(payload);
            console.log('after (google auth)', user);
        } catch (error) {
            console.error('Error during Google authentication:', error);
        } finally {
            // Guarantee loading turns off regardless of success or failure
            setLoading(false);
        }
    };

    return (
        <Button 
            fullWidth 
            onClick={handleGoogleAuth} 
            variant="outline" 
            disabled={loading}
        >
            {loading ? 'Connecting...' : `${isSignUp ? 'Sign up' : 'Sign in'} with Google`}
        </Button>
    );
}