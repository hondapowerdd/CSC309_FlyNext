import RegistrationLabel from '../account-management/RegisterLabel';
import { useState } from 'react';

export default () => {
    const [showRegLabel, setShowRegLabel] = useState(false);

    return (
        <>
            <nav className="bg-blue-900 text-white flex justify-between items-center px-6 py-4">
                <div className="text-xl font-bold">FlyNext.com</div>
                <div className="flex gap-4">
                    {/* <button>CAD</button>
                    <button>🌐</button>
                    <button className="hidden md:block">List your property</button> */}
                    <button className="border px-3 py-1 rounded" onClick={() => setShowRegLabel(true)}>Register</button>
                    <button className="border px-3 py-1 rounded">Login</button>
                </div>
            </nav>

            {
                showRegLabel && 
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Overlay that shadows and blocks interaction */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowRegLabel(false)}
                    ></div>
                    {/* Modal container */}
                    {/* Registration Form component */}
                    <RegistrationLabel close={() => setShowRegLabel(false)}/>
                </div>
            }
        </>
    );
}
