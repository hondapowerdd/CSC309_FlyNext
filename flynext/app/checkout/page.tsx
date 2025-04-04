import { useState, useEffect } from 'react';
import Booking from 'APP/components/booking/Booking';

interface Itinerary {
  id: string;
  name: string;
  bookings: Booking[];
}

interface Booking {
    id: string;
    type: string;
    status: string;
    details: Record<string, string>;
    price: number;
}

export default () => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Mock data - replace with your API call
  useEffect(() => {
    // Fetch user itineraries
    const mockItineraries: Itinerary[] = [
      {
        id: '1',
        name: 'Europe Trip 2024',
        bookings: [
          // Add mock bookings
        ],
      },
    ];
    setItineraries(mockItineraries);
  }, []);

  const currentItinerary = itineraries.find(i => i.id === selectedItinerary);
  const totalPrice = currentItinerary?.bookings.reduce((sum, booking) => sum + booking.price, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Checkout</h1>

        {/* Itinerary Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Itinerary
          </label>
          <select
            value={selectedItinerary}
            onChange={(e) => setSelectedItinerary(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose an itinerary</option>
            {itineraries.map((itinerary) => (
              <option key={itinerary.id} value={itinerary.id}>
                {itinerary.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Bookings */}
        {currentItinerary && (
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold text-blue-900">Selected Bookings</h2>
            {currentItinerary.bookings.slice(0, 3).map((booking) => (
              <Booking key={booking.id} {...booking} />
            ))}
          </div>
        )}

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-6">Payment Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="4242 4242 4242 4242"
                pattern="\d{16}"
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
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MM/YY"
                  pattern="\d{2}/\d{2}"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVC
                </label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123"
                  pattern="\d{3}"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Total and Submit */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="text-xl font-bold text-blue-900">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Complete Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}