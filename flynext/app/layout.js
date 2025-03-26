"use client"; // Convert layout.js into a client component

import "./globals.css";

import { useEffect } from "react";


// export default function RootLayout({ children }) {
//     return (
//         <html lang="en">
//         <body>{children}</body>
//         </html>
//     );
// }

export default function RootLayout({ children }) {
    useEffect(() => {
        fetch("/grid").catch(() => {}); // Preload /grid on server start
    }, []);

    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    );
}