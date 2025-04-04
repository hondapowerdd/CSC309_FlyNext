"use client";

import { useState, useContext, useEffect } from 'react';
import Booking from 'APP/components/booking/Booking';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { AuthContext } from "@/frontend/contexts/auth";
import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import { format } from "date-fns";
// @ts-ignore
import { DateRange } from "react-date-range";

const bookingsPerPage = 5;

export default () => {
    const { accessToken } = useContext(AuthContext)!;
    const { hid } = useParams<{ hid: string }>();
    const router = useRouter();

    const [allBookings, setAllBookings] = useState([]);
    const [fBookings, setFBookings] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);
    const [selectedRoom, setSelectedRoom] = useState("All");

    const [currentPage, setCurrentPage] = useState(1);

    const [dBookings, setDBookings] = useState([]);

    useEffect(() => {
        fetch(`/api/hotel/${hid}/booking`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${accessToken}` // Add authorization header
            }
        })
        .then(res => {
            res.json()
            .then(resContent => {
                if (!res.ok) return;
                setAllBookings(
                    resContent.bookings.map(
                        (booking: any) => {
                            booking.checkInDate = new Date(booking.checkInDate);
                            return booking;
                        }
                    )
                );
            });
        });
    }, []);

    useEffect(() => {
        setFBookings(allBookings.filter(booking => {
            console.log(booking.checkInDate, dateRange.startDate, );
            // @ts-ignore
            return (booking.type === selectedRoom || selectedRoom === "All") &&
            // @ts-ignore
            booking.checkInDate >= dateRange[0].startDate &&
            // @ts-ignore
            booking.checkInDate <= dateRange[0].endDate
        }));
    }, [allBookings, dateRange, selectedRoom]);

    useEffect(() => {
        // Pagination calculations
        const indexOfLastBooking = currentPage * bookingsPerPage;
        const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
        setDBookings(fBookings.slice(indexOfFirstBooking, indexOfLastBooking));
    }, [currentPage, fBookings]);
    

    // Pagination controls
    const goToPage = (pageNumber: number) => {
        setCurrentPage(Math.max(1, Math.min(pageNumber, Math.ceil(fBookings.length / bookingsPerPage))));
    };

    const nextPage = () => goToPage(currentPage + 1);
    const prevPage = () => goToPage(currentPage - 1);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="flex flex-wrap gap-4">
                {/* Back Button */}
                <button
                    onClick={() => router.back()} // Or your custom back handler
                    className="flex-none px-4 py-2 border rounded hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                    &laquo; Back
                </button>

                {/* Date Range Picker */}
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
                                onChange={(item: { selection: { startDate: Date; endDate: Date; key: string; }; }) => setDateRange([item.selection])}
                                moveRangeOnFirstSelection={false}
                                ranges={dateRange}
                            />
                        </div>
                    )}
                </div>

                {/* Room Type Select */}
                <div className="flex-1 min-w-[180px]">
                    <select 
                        className="w-full p-2 border rounded hover:bg-gray-50 transition-colors focus:ring-blue-500 focus:border-blue-500"
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                    >
                        <option value="DELUXE">All</option>
                        <option value="SINGLE">Single Room</option>
                        <option value="DOUBLE">Double Room</option>
                        <option value="SUITE">Suite</option>
                        <option value="DELUXE">Deluxe Room</option>
                    </select>
                </div>
            </div>

            <div className="mt-5 max-w-4xl mx-auto">
                {/* <h1 className="text-3xl font-bold text-blue-900 mb-8">Booking History</h1> */}
                
                {/* Bookings List */}
                <div className="space-y-4">
                {dBookings.length > 0 ? (
                    dBookings.map((booking: any) => (
                        <Booking
                            key={booking.id}
                            id={booking.id}
                            type={booking.room.type}
                            status={booking.status}
                            details={{
                                "room name": booking.room.name,
                                checkin: booking.checkInDate.toString(),
								checkout: booking.checkOutDate.toString()
                            }}
                            amount={booking.amount}
                            itineraryId={booking.itineraryId}
                            hid={hid}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No bookings found
                    </div>
                )}
                </div>

                {/* Pagination Controls */}
                <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-blue-900" />
                    </button>

                    <span className="text-sm text-gray-700">
                        Page {currentPage} of {Math.ceil(fBookings.length / bookingsPerPage)}
                    </span>

                    <button
                        onClick={nextPage}
                        disabled={currentPage === Math.ceil(fBookings.length / bookingsPerPage)}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRightIcon className="w-6 h-6 text-blue-900" />
                    </button>
                </div>
            </div>
        </div>
    );
};