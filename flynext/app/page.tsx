"use client";

import SearchBox from "./components/home/SearchBox";

export default function HomePage() {
    return (
        <div>
            {/* Hero Image + Overlay Text */}
            <div className="relative w-full h-96">
                <img
                    src="/home.jpg"
                    alt="Hero"
                    className="w-full h-96 object-cover"
                />

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <h1 className="text-4xl font-bold">Book your flight now</h1>
                        <p className="mt-2 text-lg">Best travel deals just a click away</p>
                        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>


            {/* Search Section */}
            <div className="px-6 mt-6">
                <SearchBox/>
            </div>
        </div>
    );
}
