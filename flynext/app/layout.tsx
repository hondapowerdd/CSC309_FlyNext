"use client";

import "./globals.css";
import {JSX, ReactNode } from "react";
import { AuthProvider } from "@/frontend/contexts/auth";
import Header from "./components/main/Header";

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
    return (
        <html lang="en">
        <body>
        <AuthProvider>
            <Header />
            {children}
        </AuthProvider>
        </body>
        </html>
    );
}
