"use client";

import { JSX, ReactNode } from "react";
import { useRouter, usePathname } from 'next/navigation';


interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
    const pathname = usePathname();
    const router = useRouter();

    const getButtonClass = (targetPath: string) =>
        pathname === targetPath
            ? "px-4 py-1 rounded-full bg-white text-blue-900 font-semibold transition-colors duration-200"
            : "px-4 py-1 rounded-full hover:bg-white hover:text-blue-900 transition-colors duration-200";

    return (
        <html lang="en">
        <body>
            <div className="border-t border-blue-200/50">
                <nav className="bg-blue-900 text-white flex justify-center gap-4 py-2">
                    <button
                        className={getButtonClass('/dashboard')}
                        onClick={() => router.push('/dashboard')}
                    >
                        Profile
                    </button>
                    <button
                        className={getButtonClass('/profile/order-history')}
                        onClick={() => router.push('/profile/order-history')}
                    >
                        Order History
                    </button>
                </nav>
            </div>
            {children}
        </body>
        </html>
    );
}
