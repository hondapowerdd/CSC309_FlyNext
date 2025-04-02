"use client";

import "./globals.css";
import {JSX, ReactNode } from "react";
import { AuthProvider } from "@/frontend/contexts/auth";
import Header from "./components/main/Header";
import { ShowLoginProvider } from "@/frontend/contexts/showLogin";


interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
    return (
        <html lang="en">
        <body>
        <ShowLoginProvider>
            <AuthProvider>
                <Header />
                    {children}
            </AuthProvider>
        </ShowLoginProvider>
        </body>
        </html>
    );
}
