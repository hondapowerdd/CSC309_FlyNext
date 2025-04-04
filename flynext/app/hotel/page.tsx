// "use client";
//
// import { useRouter } from "next/navigation";
// import { useState, useContext } from "react";
// // @ts-ignore
// import { DateRange } from "react-date-range";
// import "react-date-range/dist/styles.css";
// import "react-date-range/dist/theme/default.css";
// import { format } from "date-fns";
// import { AuthContext } from "@/frontend/contexts/auth";
// import { useSearchParams } from "next/navigation";
// import { useEffect } from "react";
// import axios from "axios";
//
// import NewHotelForm from "APP/components/hotel-management/NewHotelForm";
//
// export default function HotelSearchPage() {
//     const { uid } = useContext(AuthContext)!;
//     const router = useRouter();
//     const searchParams = useSearchParams();
//
//     const [showCalendar, setShowCalendar] = useState(false);
//     const [dateRange, setDateRange] = useState([
//         {
//             startDate: new Date(),
//             endDate: new Date(new Date().getTime() + 86400000),
//
//             // startDate: null,
//             // endDate: null,
//             key: "selection",
//         },
//     ]);
//
//     const [city, setCity] = useState("");
//     const [roomType, setRoomType] = useState("single");
//     const [hotelName, setHotelName] = useState("");
//     const [starRating, setStarRating] = useState("");
//     const [minPrice, setMinPrice] = useState("");
//     const [maxPrice, setMaxPrice] = useState("");
//     const [results, setResults] = useState<any[]>([]);
//
//     const [newHotes, setNewHotel] = useState(false);
//
//     const [suggestions, setSuggestions] = useState<any[]>([]);
//     const [showSuggestions, setShowSuggestions] = useState(false);
//
//     const checkInDate = format(dateRange[0].startDate, "yyyy-MM-dd");
//     const checkOutDate = format(dateRange[0].endDate, "yyyy-MM-dd");
//
//     useEffect(() => {
//         const urlCity = searchParams.get("city");
//         const checkIn = searchParams.get("checkInDate");
//
//         if (urlCity) setCity(urlCity);
//
//         if (checkIn) {
//             const [year, month, day] = checkIn.split("-").map(Number);
//             const parsed = new Date(year, month - 1, day);
//
//             if (!isNaN(parsed.getTime())) {
//                 setDateRange([
//                     {
//                         startDate: parsed,
//                         endDate: new Date(parsed.getTime() + 86400000),
//                         key: "selection",
//                     },
//                 ]);
//             }
//         }
//     }, [searchParams]);
//
//     useEffect(() => {
//         const fetchSuggestions = async () => {
//             if (city.trim()) {
//                 try {
//                     const res = await axios.get(`/api/auto-complete?query=${city}`);
//                     setSuggestions(res.data.results);
//                 } catch (err) {
//                     console.error("Autocomplete fetch failed", err);
//                 }
//             } else {
//                 setSuggestions([]);
//             }
//         };
//
//         fetchSuggestions();
//     }, [city]);
//
//
//     const searchHotels = async () => {
//         const params = new URLSearchParams({
//             city,
//             checkInDate,
//             checkOutDate,
//             name: hotelName,
//             starRating,
//             minPrice,
//             maxPrice,
//         });
//
//         const res = await fetch(`api/hotel_search/search?${params}`);
//         const data = await res.json();
//         setResults(data);
//     };
//
//     // @ts-ignore
//     return (
//         <div className="min-h-screen bg-gray-100">
//             <div className="bg-blue-800 text-white py-4 px-6 border-t border-b border-white/30">
//                 <h1 className="text-2xl font-bold">Search Hotel</h1>
//                 <div className="flex flex-row gap-x-4 items-center mt-2">
//                     <span className="text-sm">search hotel around the world.</span>
//                     <span className="text-sm-2">
//                         Don't see your property?{" "}
//                         <button
//                             onClick={() => {
//                                 if (uid) setNewHotel(true);
//                                 else document.getElementById("login-btn")?.click();
//                             }}
//                             className="underline hover:text-blue-200 transition-colors cursor-pointer"
//                         >Add</button>
//                         {" it to our database!"}
//                     </span>
//
//                     {newHotes && <NewHotelForm close={() => setNewHotel(false)}/>}
//                 </div>
//             </div>
//
//             {/* Search Bar */}
//             <div className="bg-white shadow-md rounded-lg p-4 mt-6 mx-4 space-y-4">
//                 {/* Line 1: City + Dates + Hotel Name */}
//                 <div className="flex flex-wrap gap-4">
//                     <div className="relative flex-1 min-w-[200px]">
//                         <input
//                             type="text"
//                             placeholder="Where are you going?"
//                             value={city}
//                             onChange={(e) => setCity(e.target.value)}
//                             onFocus={() => setShowSuggestions(true)}
//                             onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
//                             className="w-full border p-2 rounded"
//                         />
//                         {showSuggestions && suggestions.length > 0 && (
//                             <ul className="absolute z-10 bg-white border mt-1 w-full max-h-40 overflow-y-auto rounded shadow">
//                                 {suggestions.map((item, idx) => (
//                                     <li
//                                         key={idx}
//                                         className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
//                                         onClick={() => setCity(item.code || item.name)}
//                                     >
//                                         {item.name} {item.code ? `(${item.code})` : ""}, {item.country}
//                                     </li>
//                                 ))}
//                             </ul>
//                         )}
//                     </div>
//
//                     <div className="relative flex-1 min-w-[200px]">
//                         {/*<div*/}
//                         {/*    onClick={() => setShowCalendar(!showCalendar)}*/}
//                         {/*    className="border p-2 rounded cursor-pointer"*/}
//                         {/*>*/}
//                         {/*    {`${format(dateRange[0].startDate, "yyyy/MM/dd")} - ${format(*/}
//                         {/*        dateRange[0].endDate,*/}
//                         {/*        "yyyy/MM/dd"*/}
//                         {/*    )}`}*/}
//                         {/*</div>*/}
//
//                         <div
//                             onClick={() => setShowCalendar(!showCalendar)}
//                             className="border p-2 rounded cursor-pointer"
//                         >
//                             {dateRange[0].startDate && dateRange[0].endDate
//                                 ? `${format(dateRange[0].startDate, "yyyy/MM/dd")} - ${format(dateRange[0].endDate, "yyyy/MM/dd")}`
//                                 : "Please select date"}
//                         </div>
//
//                         {showCalendar && (
//                             <div className="absolute z-10 mt-2">
//                                 <DateRange
//                                     editableDateInputs={true}
//                                     onChange={(item: {
//                                         selection: { startDate: Date; endDate: Date; key: string; };
//                                     }) => setDateRange([item.selection])}
//                                     moveRangeOnFirstSelection={false}
//                                     ranges={dateRange}
//                                 />
//                             </div>
//                         )}
//                     </div>
//
//                     <input
//                         type="text"
//                         placeholder="Hotel name"
//                         value={hotelName}
//                         onChange={(e) => setHotelName(e.target.value)}
//                         className="flex-1 border p-2 rounded min-w-[150px]"
//                     />
//                 </div>
//
//                 {/* Line 2: Star rating + price + room type + search */}
//                 <div className="flex flex-wrap gap-4 items-center">
//                     <input
//                         type="number"
//                         placeholder="Star rating (e.g. 5)"
//                         value={starRating}
//                         onChange={(e) => setStarRating(e.target.value)}
//                         className="flex-1 border p-2 rounded min-w-[150px]"
//                     />
//
//                     <input
//                         type="number"
//                         placeholder="Min price"
//                         value={minPrice}
//                         onChange={(e) => setMinPrice(e.target.value)}
//                         className="flex-1 border p-2 rounded min-w-[100px]"
//                     />
//
//                     <input
//                         type="number"
//                         placeholder="Max price"
//                         value={maxPrice}
//                         onChange={(e) => setMaxPrice(e.target.value)}
//                         className="flex-1 border p-2 rounded min-w-[100px]"
//                     />
//
//                     {/*<select*/}
//                     {/*    className="flex-1 border p-2 rounded min-w-[150px]"*/}
//                     {/*    value={roomType}*/}
//                     {/*    onChange={(e) => setRoomType(e.target.value)}*/}
//                     {/*>*/}
//                     {/*    <option value="Single">Single</option>*/}
//                     {/*    <option value="Double">Double</option>*/}
//                     {/*    <option value="Deluxe"> Deluxe</option>*/}
//                     {/*</select>*/}
//
//                     <button
//                         className="bg-blue-600 text-white px-4 py-2 rounded min-w-[100px]"
//                         onClick={searchHotels}
//                     >
//                         Search!
//                     </button>
//                 </div>
//             </div>
//
//             {/* Result cards */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-6 mt-8">
//                 {Array.isArray(results) && results.length > 0 ? (
//                     results.map((hotel, idx) => (
//                         <div
//                             key={idx}
//                             className="bg-white p-4 shadow rounded-lg cursor-pointer hover:bg-gray-100"
//                             onClick={() => {
//                                 console.log("Hotel clicked", hotel.hid);
//                                 if (!hotel?.hid) {
//                                     console.warn(`Hotel at index ${idx} has no hid`, hotel);
//                                     return;
//                                 }
//
//                                 router.push(
//                                     `../hotel/${hotel.hid}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
//                                 );
//                             }}
//                         >
//                             <h2 className="text-lg font-bold mb-2">{hotel.name}</h2>
//                             <p className="text-sm text-gray-600">City: {hotel.city}</p>
//                             <p className="text-sm">⭐ Star Rating: {hotel.starRating}</p>
//                             <p className="text-sm">💰 Price: ${hotel.price}</p>
//                         </div>
//                     ))
//                 ) : (
//                     <p className="text-gray-500 col-span-full">No hotels found for your search.</p>
//                 )}
//             </div>
//
//         </div>
//     );
// }


"use client";

import { Suspense, useState, useContext, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "@/frontend/contexts/auth";
// @ts-ignore
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import axios from "axios";
import NewHotelForm from "APP/components/hotel-management/NewHotelForm";

function HotelSearchInner() {
    const { uid } = useContext(AuthContext)!;
    const router = useRouter();
    const searchParams = useSearchParams();

    const [showCalendar, setShowCalendar] = useState(false);
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            key: "selection",
        },
    ]);

    const [city, setCity] = useState("");
    const [roomType, setRoomType] = useState("single");
    const [hotelName, setHotelName] = useState("");
    const [starRating, setStarRating] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [results, setResults] = useState<any[]>([]);

    const [newHotes, setNewHotel] = useState(false);

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const checkInDate = format(dateRange[0].startDate, "yyyy-MM-dd");
    const checkOutDate = format(dateRange[0].endDate, "yyyy-MM-dd");

    useEffect(() => {
        const urlCity = searchParams.get("city");
        const checkIn = searchParams.get("checkInDate");

        if (urlCity) setCity(urlCity);

        if (checkIn) {
            const [year, month, day] = checkIn.split("-").map(Number);
            const parsed = new Date(year, month - 1, day);

            if (!isNaN(parsed.getTime())) {
                setDateRange([
                    {
                        startDate: parsed,
                        endDate: new Date(parsed.getTime() + 86400000),
                        key: "selection",
                    },
                ]);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (city.trim()) {
                try {
                    const res = await axios.get(`/api/auto-complete?query=${city}`);
                    setSuggestions(res.data.results);
                } catch (err) {
                    console.error("Autocomplete fetch failed", err);
                }
            } else {
                setSuggestions([]);
            }
        };

        fetchSuggestions();
    }, [city]);

    const searchHotels = async () => {
        const params = new URLSearchParams({
            city,
            checkInDate,
            checkOutDate,
            name: hotelName,
            starRating,
            minPrice,
            maxPrice,
        });

        const res = await fetch(`api/hotel_search/search?${params}`);
        const data = await res.json();
        setResults(data);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-blue-800 text-white py-4 px-6 border-t border-b border-white/30">
                <h1 className="text-2xl font-bold">Search Hotel</h1>
                <div className="flex flex-row gap-x-4 items-center mt-2">
                    <span className="text-sm">search hotel around the world.</span>
                    <span className="text-sm-2">
                        Don&apos;t see your property?{" "}
                        <button
                            onClick={() => {
                                if (uid) setNewHotel(true);
                                else document.getElementById("login-btn")?.click();
                            }}
                            className="underline hover:text-blue-200 transition-colors cursor-pointer"
                        >
                            Add
                        </button>
                        {" it to our database!"}
                    </span>

                    {newHotes && <NewHotelForm close={() => setNewHotel(false)} />}
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white shadow-md rounded-lg p-4 mt-6 mx-4 space-y-4">
                <div className="flex flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Where are you going?"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            className="w-full border p-2 rounded"
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="absolute z-10 bg-white border mt-1 w-full max-h-40 overflow-y-auto rounded shadow">
                                {suggestions.map((item, idx) => (
                                    <li
                                        key={idx}
                                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                                        onClick={() => setCity(item.code || item.name)}
                                    >
                                        {item.name} {item.code ? `(${item.code})` : ""}, {item.country}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="relative flex-1 min-w-[200px]">
                        <div
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="border p-2 rounded cursor-pointer"
                        >
                            {dateRange[0].startDate && dateRange[0].endDate
                                ? `${format(dateRange[0].startDate, "yyyy/MM/dd")} - ${format(dateRange[0].endDate, "yyyy/MM/dd")}`
                                : "Please select date"}
                        </div>

                        {showCalendar && (
                            <div className="absolute z-10 mt-2">
                                <DateRange
                                    editableDateInputs={true}
                                    onChange={(item: {
                                        selection: { startDate: Date; endDate: Date; key: string };
                                    }) => setDateRange([item.selection])}
                                    moveRangeOnFirstSelection={false}
                                    ranges={dateRange}
                                />
                            </div>
                        )}
                    </div>

                    <input
                        type="text"
                        placeholder="Hotel name"
                        value={hotelName}
                        onChange={(e) => setHotelName(e.target.value)}
                        className="flex-1 border p-2 rounded min-w-[150px]"
                    />
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <input
                        type="number"
                        placeholder="Star rating (e.g. 5)"
                        value={starRating}
                        onChange={(e) => setStarRating(e.target.value)}
                        className="flex-1 border p-2 rounded min-w-[150px]"
                    />

                    <input
                        type="number"
                        placeholder="Min price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="flex-1 border p-2 rounded min-w-[100px]"
                    />

                    <input
                        type="number"
                        placeholder="Max price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="flex-1 border p-2 rounded min-w-[100px]"
                    />

                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded min-w-[100px]"
                        onClick={searchHotels}
                    >
                        Search!
                    </button>
                </div>
            </div>

            {/* Result cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-6 mt-8">
                {Array.isArray(results) && results.length > 0 ? (
                    results.map((hotel, idx) => (
                        <div
                            key={idx}
                            className="bg-white p-4 shadow rounded-lg cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                                if (!hotel?.hid) return;
                                router.push(
                                    `../hotel/${hotel.hid}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
                                );
                            }}
                        >
                            <h2 className="text-lg font-bold mb-2">{hotel.name}</h2>
                            <p className="text-sm text-gray-600">City: {hotel.city}</p>
                            <p className="text-sm">⭐ Star Rating: {hotel.starRating}</p>
                            <p className="text-sm">💰 Price: ${hotel.price}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 col-span-full">No hotels found for your search.</p>
                )}
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="p-8">Loading search page...</div>}>
            <HotelSearchInner />
        </Suspense>
    );
}
