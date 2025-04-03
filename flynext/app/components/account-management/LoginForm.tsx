import { useEffect, useState, useContext } from 'react';
import { AuthContext } from "@/frontend/contexts/auth";

export default ({ close }: { close: () => void }) => {
    const [uid, setUid] = useState('');
    const [password, setPassword] = useState('');

    const [message, setMessage] = useState('');

    const [submitDisabled, setSubmitDisabled] = useState(false);
    useEffect(() => {
        const newStatus = uid.length < 10 || password.length < 1;
        if (submitDisabled !== newStatus) setSubmitDisabled(newStatus);
    }, [uid, password]);

    const auth = useContext(AuthContext)!;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        fetch(
			`/api/${uid}/login`,
			{
				method: "POST",
				body: JSON.stringify({ password })
			}
		)
		.then(res => {
            console.log(1);
			res.json()
			.then(resContent => {
				if (!res.ok) return setMessage(resContent.error);
                const cookies = {
                    uid,
                    ...(resContent.tokens)
                }
				auth.setUid(uid);
				auth.setAccessToken(cookies.accessToken);
				auth.setRefreshToken(cookies.refreshToken);
                console.log(resContent.tokens);
                document.cookie = Object.keys(cookies).map(k => `${k}=${cookies[k]};`).join("");
                close();
			});
		})
        .catch(resContent => setMessage(resContent.error));
    };

    return (
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-md p-6 mx-auto">
            {/* Close Button */}
            <button 
                type="button" 
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={close}
                aria-label="Close"
            >
                &times;
            </button>

            <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

            <form className="space-y-4" onSubmit={submit}>
                {/* UID Field */}
                <div>
                <label htmlFor="uid" className="block text-sm font-medium text-gray-700">
                    UID
                </label>
                <input
                    type="text"
                    id="uid"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 transition-all"
                    value={uid}
                    onChange={e => setUid(e.target.value)}
                    required
                    // minLength={10}
                    // maxLength={10}
                    // pattern="[A-Za-z0-9]{10}" // Remove if alphanumeric UID is allowed
                    title="10-character alphanumeric ID"
                    autoComplete="uid"
                />
                </div>

                {/* Password Field */}
                <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 transition-all"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                />
                </div>

                <p className="text-gray-700">{message}</p>

                {/* Submit Button */}
                <div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    disabled={submitDisabled}
                >
                    Login
                </button>
                </div>
            </form>
        </div>
    );
};
