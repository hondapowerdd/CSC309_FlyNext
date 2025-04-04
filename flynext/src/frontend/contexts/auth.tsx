import { cookies } from "next/headers";
import { createContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from "react";

type SetState<T> = Dispatch<SetStateAction<T>>;

interface AuthContextInterface {
	uid: string;
	accessToken: string;
	refreshToken: string;
	login: (info: Record<string, string>) => void;
	logout: () => void;
}

export const AuthContext = createContext<AuthContextInterface>({
	uid: "",
	accessToken: "",
	refreshToken: "",
	login: (_) => {},
	logout: () => {}
});

type AuthCookies = {
    uid: string;
    accessToken: string;
    refreshToken: string;
};

interface AuthProviderProps {
	children: ReactNode;
}

export const saveCookies = (cookies: Record<string, string>, hoursToLive=24) => {
	Object.entries(cookies).forEach(([k, v]) => {
		document.cookie = `${encodeURIComponent(k)}=${encodeURIComponent(v)}; path=/; SameSite=Lax; max-age=${hoursToLive * 60 * 60}`;
	});
}

export const clearCookies = (keys: Array<string>) => {
	keys.forEach(k => document.cookie = `${encodeURIComponent(k)}=; path=/; SameSite=Lax; max-age=0;`);
}

export const getCookies = (keys: Array<string>) => {
	return document.cookie.split(';').reduce((acc, pair) => {
	  const [k, v] = pair.trim().split('=').map(decodeURIComponent);
	  return k && keys.includes(k) ? { ...acc, [k]: v } : acc;
	}, {} as Record<string, string>);
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [uid, setUid] = useState<string>("");
	const [accessToken, setAccessToken] = useState<string>("");
	const [refreshToken, setRefreshToken] = useState<string>("");

	useEffect(() => {
		const cookies: AuthCookies = Object.assign({
			uid: "",
			accessToken: "",
			refreshToken: ""
		}, getCookies(["uid", "accessToken", "refreshToken"]));

		if (cookies.uid !== uid) setUid(cookies.uid);
		if (cookies.accessToken !== accessToken) setAccessToken(cookies.accessToken);
		if (cookies.refreshToken !== refreshToken) setRefreshToken(cookies.refreshToken);
	}, []);

	return (
		<AuthContext.Provider value={{
			uid, accessToken, refreshToken,
			login: (info) => {
				setUid(info["uid"]);
				setAccessToken(info["accessToken"]);
				setRefreshToken(info["refreshToken"]);
				saveCookies(info);
			},
			logout: () => {
				setUid("");
				setAccessToken("");
				setRefreshToken("");
				clearCookies(["uid", "accessToken", "refreshToken"]);
			}
		}}>
			{children}
		</AuthContext.Provider>
	);
};