"use client";

import Button from "@/components/Button";
import { useRouter} from 'next/navigation';
export default function Hero() {
      const router = useRouter();
    
    const login = () => {
        // Navigate to the settings page for the current siteId
        router.push(`/login`);
    };
    return (
        <section
            className="py-24 overflow-x-clip "
        >
            <div className="container relative h_p_GH">
                <div className="flex justify-center">
                    <div className="inline-flex py-1 px-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full text-neutral-950 font-semibold">
                        ✨ $7.5M eed round raised
                    </div>
                </div>
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-medium text-center mt-6 text-white">
                Build Your Dream Website in Minutes!
                </h1>
                <p className="text-center text-xl text-white/50 mt-8 max-w-2xl mx-auto">
                Join thousands of creators and entrepreneurs using our platform to turn ideas into reality. No coding required.
                </p>
                <form className="mx-auto flex border border-white/50 rounded-full p-2 mt-8 max-w-lg">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="bg-transparent px-4 flex-1 w-full"
                    />
                   <Button
                  variant="primary"
                  className="hidden lg:inline-flex items-center"
                  onClick={login}
                >
                  Signup
                </Button>
                </form>
            </div>
        </section>
    );
}