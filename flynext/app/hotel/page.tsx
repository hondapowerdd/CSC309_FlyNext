"use client";

import { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main CSS
import "react-date-range/dist/theme/default.css"; // theme CSS

import { format } from "date-fns";

export default function HotelSearchPage() {
    const [showCalendar, setShowCalendar] = useState(false);
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);

    const [roomType, setRoomType] = useState("single");

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-blue-900 text-white py-4 px-6">
                <h1 className="text-2xl font-bold">Search Hotel</h1>
                <p className="text-sm mt-1">search hotel around the world</p>
            </div>

            {/* Search Bar */}
            <div className="bg-white shadow-md rounded-lg p-4 mt-6 mx-4 flex flex-wrap md:flex-nowrap gap-4 items-center">
                {/* Destination */}
                <input
                    type="text"
                    placeholder="Where are you going?"
                    className="flex-1 border p-2 rounded min-w-[200px]"
                />

                {/* Date Picker */}
                <div className="relative flex-1 min-w-[200px]">
                    <div
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="border p-2 rounded cursor-pointer"
                    >
                        {`${format(dateRange[0].startDate, "yyyy/MM/dd")} - ${format(
                            dateRange[0].endDate,
                            "yyyy/MM/dd"
                        )}`}
                    </div>
                    {showCalendar && (
                        <div className="absolute z-10 mt-2">
                            <DateRange
                                editableDateInputs={true}
                                onChange={(item) => setDateRange([item.selection])}
                                moveRangeOnFirstSelection={false}
                                ranges={dateRange}
                            />
                        </div>
                    )}
                </div>

                {/* Room Type */}
                <select
                    className="flex-1 border p-2 rounded min-w-[200px]"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="suite">Suite</option>
                    <option value="family">Family</option>
                </select>

                {/* Search Button */}
                <button className="bg-blue-600 text-white px-4 py-2 rounded min-w-[100px]">
                    Search!
                </button>
            </div>
        </div>
    );
}
