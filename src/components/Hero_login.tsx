"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendSignInLinkToEmail } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function Hero() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                console.log("Logged in successfully");
                // Redirect to dashboard or home page after login
                router.push('/dashboard');
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                const actionCodeSettings = {
                    url: `${window.location.origin}/verify?email=${email}`,
                    handleCodeInApp: true,
                };
                await sendSignInLinkToEmail(auth, email, actionCodeSettings);
                localStorage.setItem('emailForSignIn', email);
                console.log("Signed up successfully");
                router.push('/verify');
            }
        } catch (error: any) {
            if (error.code === "auth/email-already-in-use") {
                setError("This email is already in use. Please try logging in instead.");
            } else {
                setError(error.message);
            }
        }
    };
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider(); // Initialize the GoogleAuthProvider

      // Sign in with the popup
      await signInWithPopup(auth, provider);

      // After a successful sign-in, push to the dashboard (or any other page you wish)
      router.push("/dashboard");
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };
    return (
        <section className="py-24 overflow-x-clip">
            <div className="container relative h_p_GH">
                <div className="flex justify-center">
                    <div className="inline-flex py-1 px-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full text-neutral-950 font-semibold">
                        ✨ More than 2K people have already registered.
                    </div>
                </div>
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-medium text-center mt-6 text-white">
                Connect to Eix
                </h1>
                <p className="text-center text-xl text-white/50 mt-8 max-w-2xl mx-auto">
                    Join thousands of creators and entrepreneurs using our platform to turn ideas into reality. No coding required.
                </p>
                <p className="text-center text-xl text-white/50 mt-8 max-w-2xl mx-auto">
                It's free for everyone.
                </p>
                <form onSubmit={handleSubmit} className="button_google mx-auto flex flex-col border border-white/50 rounded-lg p-4 mt-8 max-w-lg">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="button_google bg-transparent px-4 py-2 mb-2 border border-white/50 rounded-md text-white placeholder-white/50"
                    />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="button_google bg-transparent px-4 py-2 mb-2 border border-white/50 rounded-md text-white placeholder-white/50"
                    />
                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                    <Button
                        size="sm"
                        className="whitespace-nowrap mb-2 button_google"
                        type="submit"
                        variant="primary"
                    >
                        {isLogin ? "Log In" : "Sign Up"}
                    </Button>
                    <Button
                        size="sm"
                        className="whitespace-nowrap button_google"
                        type="button"
                        variant="secondary"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}
                    </Button>
                    <Button
                        size="sm"
                        className="whitespace-nowrap button_google"
                        type="button"
                        variant="secondary"
                        onClick={signInWithGoogle}
                    >
                        sign up with Google
                    </Button>
                </form>
            </div>
        </section>
    );
}

