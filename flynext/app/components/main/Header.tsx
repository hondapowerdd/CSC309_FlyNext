'use client';

import RegisterForm from '../account-management/RegisterForm';
import LoginForm from '../account-management/LoginForm';
import AccountDropdown from '../account-management/AccountDropdown';
import { useState, useContext } from 'react';
import { AuthContext } from "@/frontend/contexts/auth";
import Navigator from './Navigator';
import { useRouter } from 'next/navigation';
import { useShowLogin } from "@/frontend/contexts/showLogin";

export default () => {
    const { uid } = useContext(AuthContext)!;
    const router = useRouter();

    const [showRegForm, setShowRegForm] = useState(false);
    const { showLogin, setShowLogin } = useShowLogin();
    const [showDropdn, setShowDropdn] = useState(false);

    return (
        <>
            <header className="relative bg-blue-900 text-white flex justify-between items-center px-6 py-4">
                <button
                    className="text-xl font-bold"
                    onClick={() => router.push('/')}
                >
                    FlyNext.com
                </button>
                <div className="flex gap-4">
                    {
                        uid ? (
                            <>
                                <button 
                                    className="border px-3 py-1 rounded" 
                                    onClick={() => setShowDropdn(true)}
                                >
                                    {uid}
                                </button>
                                {showDropdn && <AccountDropdown close={() => setShowDropdn(false)} />}
                                <button
                                    className="border px-3 py-1 rounded"
                                    onClick={() => router.push('/notification')}
                                >
                                    🔔
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    className="border px-3 py-1 rounded" 
                                    onClick={() => setShowRegForm(true)}
                                >
                                    Register
                                </button>
                                <button 
                                    id="login-btn" 
                                    className="border px-3 py-1 rounded" 
                                    onClick={() => setShowLogin(true)}
                                >
                                    Login
                                </button>
                                <button
                                    className="border px-3 py-1 rounded"
                                    onClick={() => {
                                        if (uid) router.push('/notification');
                                        else setShowLogin(true);
                                    }}
                                >
                                    🔔
                                </button>
                            </>
                        )
                    }
                </div>
            </header>

            <Navigator />

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

            {showLogin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowLogin(false)}
                    ></div>
                    <LoginForm close={() => setShowLogin(false)} />
                </div>
            )}

        </>
    );
};
