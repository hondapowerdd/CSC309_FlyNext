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
        <>
            <div className="border-t border-blue-200/50">
                <nav className="bg-blue-900 text-white flex justify-center gap-4 py-2">
                    <button
                        className={getButtonClass('/dashboard')}
                        onClick={() => router.push('/dashboard')}
                    >
                        Profile
                    </button>
                    <button
                        className={getButtonClass('/dashboard/booking-history')}
                        onClick={() => router.push('/dashboard/booking-history')}
                    >
                        Booking History
                    </button>
                    <button
                        className={getButtonClass('/dashboard/manage_hotel')}
                        onClick={() => router.push("/dashboard/manage_hotel")}
                    >
                        Manage hotels
                    </button>
                </nav>
            </div>
            {children}
        </>
    );
}
