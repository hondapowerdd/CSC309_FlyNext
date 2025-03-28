"use client"; // Convert layout.js into a client component

import "./globals.css";
import Header from "./components/Header";


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
            <Header />
            {children}
        </body>
        </html>
    );
}