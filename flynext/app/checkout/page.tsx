"use client"

import { useState, useEffect, useContext  } from 'react';
import Booking from 'APP/components/booking/Booking';
import { AuthContext } from "@/frontend/contexts/auth";

export default () => {
	const [itineraries, setItineraries] = useState<Itinerary[]>([]);
	const [selectedItinerary, setSelectedItinerary] = useState<any>("");
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [total, setTotal] = useState(0);
	const [cardDetails, setCardDetails] = useState({
		number: '',
		expiry: '',
		cvc: ''
	});
	const { accessToken } = useContext(AuthContext)!;

	// Fetch itineraries on mount
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
				setItineraries(resContent.itineraries.filter((itinerary: any) => {
					return !itinerary.invoices &&
					itinerary.bookings.some((booking: any) => booking.type === "Flight");
				}));
				console.log(resContent);
			});
		});
	}, []);

	// Update bookings when itinerary changes
	useEffect(() => {

		if (selectedItinerary) setBookings(selectedItinerary.bookings);
		else setBookings([]);
	}, [selectedItinerary, itineraries]);

	// Calculate total
	useEffect(() => {
		setTotal(bookings.reduce((total, booking) => {
			if (booking.type === "Hotel") return total += Math.ceil(
				((new Date(booking.checkOutDate)).getTime() - (new Date(booking.checkInDate)).getTime())
				/ (1000 * 60 * 60 * 24)
			);
			else total += booking.flight.price;
		}, 0));
		
	}, [bookings]);

	const checkout = async (e: React.FormEvent) => {
		e.preventDefault();
		// Add your payment processing logic here
		console.log('Processing payment...', cardDetails);
	};

	if (itineraries.length === 0) {
		return (
			<div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
				<div className="text-center text-gray-600">
					<p className="text-xl">No bookings for checkout</p>
					<p className="mt-2">A booking for checkout must include a flight</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-4 md:p-8">
		<div className="max-w-4xl mx-auto">
			<div className="bg-white rounded-lg shadow-md p-6">
			{/* Itinerary Selector */}
			<div className="mb-6">
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Select Itinerary
				</label>
				<select
					value={selectedItinerary? selectedItinerary.id:""}
					onChange={(e) => setSelectedItinerary(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
				>
					<option value="">Choose an itinerary</option>
					{itineraries.map((itinerary) => (
						<option key={itinerary.id} value={itinerary.id}>
							{itinerary.id}
						</option>
					))}
				</select>
			</div>

			{/* Bookings List */}
			{bookings.length > 0 ? (
				<>
				<div className="space-y-4 mb-6">
					{bookings.map((booking) => (
						<Booking
							key={booking.id}
							id={booking.id}
							type={booking.type}
							status={""}
							details={booking.type === "Flight"? booking.flight:{
								hotel: booking.hotel.name,
								room: booking.room.name,
								checkin: booking.checkInDate,
								checkout: booking.checkOutDate
							}}
							amount={booking.amount}
							itineraryId={booking.itineraryId}
							hid={null}
						/>
					))}
				</div>

				{/* Total and Payment */}
				<div className="border-t pt-6">
					<div className="flex justify-between items-center mb-6">
					<span className="text-lg font-semibold">Total:</span>
					<span className="text-2xl font-bold text-blue-900">
						${total.toFixed(2)}
					</span>
					</div>

					{/* Payment Form */}
					<form onSubmit={checkout} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
						Card Number
						</label>
						<input
						type="text"
						placeholder="4242 4242 4242 4242"
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
						value={cardDetails.number}
						onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
						required
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Expiration Date
						</label>
						<input
							type="text"
							placeholder="MM/YY"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							value={cardDetails.expiry}
							onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
							required
						/>
						</div>

						<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							CVC
						</label>
						<input
							type="text"
							placeholder="123"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							value={cardDetails.cvc}
							onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
							required
						/>
						</div>
					</div>

					<button
						type="submit"
						className="w-full py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
					>
						Complete Checkout
					</button>
					</form>
				</div>
				</>
			) : (
				<div className="text-center text-gray-500 py-8">
				{selectedItinerary ? 
					"No bookings available in this itinerary" : 
					"Please select an itinerary"}
				</div>
			)}
			</div>
		</div>
		</div>
	);
}