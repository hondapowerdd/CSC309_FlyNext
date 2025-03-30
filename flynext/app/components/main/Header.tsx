'use client';

import RegisterForm from '../account-management/RegisterForm';
import LoginForm from '../account-management/LoginForm';
import AccountDropdown from '../account-management/AccountDropdown';
import { useState, useContext } from 'react';
import { AuthContext } from "@/frontend/contexts/auth";
import { useRouter, usePathname } from 'next/navigation';

export default () => {
    const { uid } = useContext(AuthContext)!;
    const router = useRouter();
    const pathname = usePathname();

    const [showRegForm, setShowRegForm] = useState(false);
    const [showLogForm, setShowLogForm] = useState(false);
    const [showDropdn, setshowDropdn] = useState(false);

    const getButtonClass = (targetPath: string) =>
        pathname === targetPath
            ? "px-4 py-1 rounded-full bg-white text-blue-900 font-semibold"
            : "px-4 py-1 rounded-full hover:bg-white hover:text-blue-900";

    return (
        <>
            <nav className="relative bg-blue-900 text-white flex justify-between items-center px-6 py-4">
                <div className="text-xl font-bold">FlyNext.com</div>
                <div className="flex gap-4">
                    {
                        uid &&
                        <>
                            <button className="border px-3 py-1 rounded" onClick={() => setshowDropdn(true)}>{uid}</button>
                            {
                                showDropdn &&
                                <AccountDropdown close={() => setshowDropdn(false)} />
                            }
                        </>
                    }
                    {
                        !uid &&
                        <>
                            <button className="border px-3 py-1 rounded" onClick={() => setShowRegForm(true)}>Register</button>
                            <button className="border px-3 py-1 rounded" onClick={() => setShowLogForm(true)}>Login</button>
                        </>
                    }
                </div>
            </nav>

            {/* Search type bar */}
            <div className="bg-blue-900 text-white flex justify-center gap-4 py-2">
                <button
                    className={getButtonClass('/hotel')}
                    onClick={() => router.push('/hotel')}
                >
                    Hotel
                </button>
                <button
                    className={getButtonClass('/flight_search')}
                    onClick={() => router.push('/flight_search')}
                >
                    Flights
                </button>
                <button
                    className={getButtonClass('/hotel_flight')}
                    onClick={() => router.push('/hotel_flight')}
                >
                    Hotel + Flights
                </button>
            </div>

            {
                showRegForm &&
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowRegForm(false)}
                    ></div>
                    <RegisterForm close={() => setShowRegForm(false)} />
                </div>
            }

            {
                showLogForm &&
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowLogForm(false)}
                    ></div>
                    <LoginForm close={() => setShowLogForm(false)} />
                </div>
            }
        </>
    );
};
