import { createContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from "react";

type SetState<T> = Dispatch<SetStateAction<T>>;

interface AuthContextInterface {
	uid: string;
	setUid: SetState<string>;
	accessToken: string;
	setAccessToken: SetState<string>;
	refreshToken: string;
	setRefreshToken: SetState<string>;
}

export const AuthContext = createContext<AuthContextInterface>({
	uid: "",
	setUid: () => {},
	accessToken: "",
	setAccessToken: () => {},
	refreshToken: "",
	setRefreshToken: () => {},
});

type AuthCookies = {
    uid: string;
    accessToken: string;
    refreshToken: string;
};

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [uid, setUid] = useState<string>("");
	const [accessToken, setAccessToken] = useState<string>("");
	const [refreshToken, setRefreshToken] = useState<string>("");

	useEffect(() => {
		const cookies: AuthCookies = {
			uid: "",
			accessToken: "",
			refreshToken: ""
		};
		document.cookie.split(";").forEach(cookie => {
			const [rawKey, ...values] = cookie.trim().split("=");
			const key = rawKey?.trim() as keyof AuthCookies;
			const value = values.join("=");
			
			if (key && value && key in cookies) cookies[key] = value;
		});

		if (cookies.uid === uid) return;
		setUid(cookies.uid);
		setAccessToken(cookies.accessToken);
		setRefreshToken(cookies.refreshToken);
	}, []);

	return (
		<AuthContext.Provider value={{
			uid, setUid,
			accessToken, setAccessToken,
			refreshToken, setRefreshToken
		}}>
			{children}
		</AuthContext.Provider>
	);
};