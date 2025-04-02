"use client";

import { createContext, useState, ReactNode, useContext } from "react";

interface ShowLoginContextType {
    showLogin: boolean;
    setShowLogin: (show: boolean) => void;
}

export const ShowLoginContext = createContext<ShowLoginContextType | undefined>(undefined);

export function ShowLoginProvider({ children }: { children: ReactNode }) {
    const [showLogin, setShowLogin] = useState(false);

    return (
        <ShowLoginContext.Provider value={{ showLogin, setShowLogin }}>
            {children}
        </ShowLoginContext.Provider>
    );
}

export function useShowLogin() {
    const context = useContext(ShowLoginContext);
    if (!context) {
        throw new Error("useShowLogin must be used within a ShowLoginProvider");
    }
    return context;
}
