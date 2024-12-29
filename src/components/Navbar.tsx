"use client";

import { Menu, X } from "lucide-react";
import Button from "@/components/Button";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase"; // Ensure Firebase is properly initialized
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth"; // Assuming you have a custom hook for auth state
import '../app/globals.css'
const navLinks = [
  { label: "Home", href: "#" },
  { label: "Features", href: "features" },
  { label: "Integrations", href: "#integrations" },
  { label: "FAQs", href: "#faqs" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth(); // Assuming this hook returns the authenticated user.

  useEffect(() => {
    if (user) {
      router.push("/dashboard"); // Redirect to dashboard if the user is authenticated.
    }
  }, [user, router]);

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
  const login = () => {
     
      // Navigate to the settings page for the current siteId
      router.push(`/login`);
    
  };
  return (
    <>
      <section className="h_p py-4 lg:py-8 fixed w-full top-0 z-50">
        <div className="container max-w-5xl">
          <div className="border border-white/15 rounded-[27px] lg:rounded-full bg-neutral-950/70 backdrop-blur">
            <figure className="grid grid-cols-2 lg:grid-cols-3 py-2 lg:px-2 px-4 items-center">
              <div>
                <span className="Eix_span_text">E<span className="Eix_span_text_i">i</span>x</span>
              </div>
              <div className="hidden lg:flex justify-center items-center">
                <nav className="flex gap-6 font-medium">
                  {navLinks.map((each) => (
                    <a href={each.href} key={each.href} className="text-white">
                      {each.label}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="lg:hidden"
                >
                  {!isOpen ? (
                    <motion.div
                      initial={{ opacity: 1 }}
                      animate={{
                        opacity: isOpen ? 0 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Menu className="text-white" size={30} />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: isOpen ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <X className="text-white" size={30} />
                    </motion.div>
                  )}
                </button>
                <Button
                  variant="secondary"
                  onClick={login}
                  className="hidden lg:inline-flex items-center"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  className="hidden lg:inline-flex items-center"
                  onClick={signInWithGoogle}
                >
                  Signup
                </Button>
              </div>
            </figure>
          </div>
        </div>
      </section>
      <div className="pb-[86px] md:pb-[98px]"></div>
    </>
  );
}
