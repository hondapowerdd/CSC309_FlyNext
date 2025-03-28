import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

type SetState<T> = Dispatch<SetStateAction<T>>;

interface AuthContextInterface {
	uid: string | null;
	setUid: SetState<string | null>;
	accessToken: string | null;
	setAccessToken: SetState<string | null>;
	refreshToken: string | null;
	setRefreshToken: SetState<string | null>;
}

export const AuthContext = createContext<AuthContextInterface | null>(null);

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [uid, setUid] = useState<string | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [refreshToken, setRefreshToken] = useState<string | null>(null);

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