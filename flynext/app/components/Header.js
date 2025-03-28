export default function Navbar() {
    return (
        <nav className="bg-blue-900 text-white flex justify-between items-center px-6 py-4">
            <div className="text-xl font-bold">FlyNext.com</div>
            <div className="flex gap-4">
                {/* <button>CAD</button>
                <button>🌐</button>
                <button className="hidden md:block">List your property</button> */}
                <button className="border px-3 py-1 rounded">Register</button>
                <button className="border px-3 py-1 rounded">Login</button>
            </div>
        </nav>
    );
}
