"use client";

import { useState, useContext, useEffect } from 'react';
import Booking from 'APP/components/booking/Booking';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { AuthContext } from "@/frontend/contexts/auth";

const bookingsPerPage = 5;

type BookingType = {
	id: string;
	type: string;
	status: string;
	details: Record<string, string>;
};

const fetchBookings = async (accessToken: string) => {
	await fetch('/api/booking', {
		method: "GET",
		headers: {
			'Authorization': `Bearer ${accessToken}` // Add authorization header
		}
	})
}

export default () => {
	const { accessToken } = useContext(AuthContext)!;

	const [bookings, setBookings] = useState<BookingType[]>([]);

	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		fetch('/api/booking', {
			method: "GET",
			headers: {
				'Authorization': `Bearer ${accessToken}` // Add authorization header
			}
		})
		.then(res => {
			res.json()
			.then(resContent => {
				if (!res.ok) return;
				setBookings(resContent.bookings.map((booking: any) => {
					return {
						id: booking.id,
						type: booking.type,
						status: booking.status,
						details: booking.type === "HOTEL"? {
							hotel: booking.hotel.name,
							room: booking.room.name,
							checkin: booking.checkInDate,
							checkout: booking.checkOutDate
						}:{
							flight: booking.flightReference
						}
					}
				}));
				console.log(resContent);
			});
		});
	}, []);

	// Pagination calculations
	const indexOfLastBooking = currentPage * bookingsPerPage;
	const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
	const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
	const totalPages = Math.ceil(bookings.length / bookingsPerPage);

	// Pagination controls
	const goToPage = (pageNumber: number) => {
		setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
	};

	const nextPage = () => goToPage(currentPage + 1);
	const prevPage = () => goToPage(currentPage - 1);

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-4xl mx-auto">
				{/* <h1 className="text-3xl font-bold text-blue-900 mb-8">Booking History</h1> */}
				
				{/* Bookings List */}
				<div className="space-y-4">
				{currentBookings.length > 0 ? (
					currentBookings.map((booking) => (
						<Booking
							key={booking.id}
							id={booking.id}
							type={booking.type}
							status={booking.status}
							details={booking.details}
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
					Page {currentPage} of {totalPages}
				</span>

				<button
					onClick={nextPage}
					disabled={currentPage === totalPages}
					className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<ChevronRightIcon className="w-6 h-6 text-blue-900" />
				</button>
				</div>
			</div>
		</div>
	);
};