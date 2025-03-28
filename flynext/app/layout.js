"use client"; // Convert layout.js into a client component

import "./globals.css";
import { AuthProvider } from "@/frontend/contexts/auth";
import Header from "./components/main/Header";


// export default function RootLayout({ children }) {
//     return (
//         <html lang="en">
//         <body>{children}</body>
//         </html>
//     );
// }

export default function RootLayout({ children }) {

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