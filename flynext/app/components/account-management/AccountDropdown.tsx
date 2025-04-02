import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from "@/frontend/contexts/auth";
import { useRouter } from 'next/navigation';

export default ({ close }: { close: () => void }) => {
    const { setUid, setAccessToken, setRefreshToken } = useContext(AuthContext)!;

    const router = useRouter();
    const dpdn = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dpdn?.current?.focus();
    }, [dpdn]);

    return (
        <div
            ref={dpdn}
            className="absolute right--0 mt-9 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
            role="menu"
            tabIndex={0}
            onBlur={({ target, relatedTarget }) => {
                if (!target.contains(relatedTarget)) return close();
                dpdn.current?.focus();
            }}
        >
            <div className="py-1" role="none">
            <button
                onClick={() => router.push('/dashboard')}
                className="block w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 text-left"
                role="menuitem"
            >
                Dashboard
            </button>
            <button
                onClick={() => {
                    console.log(1);
                    setUid("");
                    setAccessToken("");
                    setRefreshToken("");
                    document.cookie = "uid=;accessToken=;refreshToken;";
                    close();
                }}
                className="block w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 text-left"
                role="menuitem"
            >
                Logout
            </button>
            </div>
        </div>
    );
};