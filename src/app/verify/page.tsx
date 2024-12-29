"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import Button from "@/components/Button";

export default function VerifyEmail() {
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const email = localStorage.getItem('emailForSignIn');
        if (email && isSignInWithEmailLink(auth, window.location.href)) {
            signInWithEmailLink(auth, email, window.location.href)
                .then((result) => {
                    localStorage.removeItem('emailForSignIn');
                    const user = result.user;
                    // Set custom user ID (VeriPay)
                    user.updateProfile({
                        displayName: `VeriPay${user.uid}`
                    }).then(() => {
                        console.log("User profile updated successfully");
                        router.push('/dashboard');
                    }).catch((error) => {
                        console.error("Error updating user profile:", error);
                    });
                })
                .catch((error) => {
                    setError('Error verifying email: ' + error.message);
                });
        }
    }, [router]);

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically verify the code with your backend
        // For this example, we'll just simulate a successful verification
        console.log("Verification code:", verificationCode);
        // Redirect to dashboard after successful verification
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-800">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 shadow-xl max-w-md w-full">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Verify Your Email</h2>
                <p className="text-white/80 mb-4 text-center">
                    We've sent a verification link to your email. Please check your inbox and click the link to verify your account.
                </p>
                <form onSubmit={handleVerification} className="space-y-4">
                    <div className="flex justify-center space-x-2">
                        {[...Array(6)].map((_, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                className="w-12 h-12 text-center text-2xl rounded-md bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={verificationCode[index] || ""}
                                onChange={(e) => {
                                    const newCode = verificationCode.split("");
                                    newCode[index] = e.target.value;
                                    setVerificationCode(newCode.join(""));
                                    if (e.target.value && e.target.nextElementSibling) {
                                        (e.target.nextElementSibling as HTMLInputElement).focus();
                                    }
                                }}
                            />
                        ))}
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <Button
                        size="lg"
                        className="w-full"
                        type="submit"
                        variant="primary"
                    >
                        Verify Email
                    </Button>
                </form>
            </div>
        </div>
    );
}

