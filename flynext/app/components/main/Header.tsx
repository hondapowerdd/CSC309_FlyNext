'use client';

import RegisterForm from '../account-management/RegisterForm';
import LoginForm from '../account-management/LoginForm';
import AccountDropdown from '../account-management/AccountDropdown';
import { useState, useContext } from 'react';
import { AuthContext } from "@/frontend/contexts/auth";
import Navigator from './Navigator';

export default () => {
    const { uid } = useContext(AuthContext)!;
    

    const [showRegForm, setShowRegForm] = useState(false);
    const [showLogForm, setShowLogForm] = useState(false);
    const [showDropdn, setshowDropdn] = useState(false);

    return (
        <>
            <header className="relative bg-blue-900 text-white flex justify-between items-center px-6 py-4">
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
