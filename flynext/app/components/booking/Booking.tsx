import { DocumentArrowDownIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useContext, useState } from 'react';
import { AuthContext } from '@/frontend/contexts/auth';
import { jsPDF } from 'jspdf';

interface BookingCardProps {
	id: string;
	type: string | null;
	status: string;
	details: Record<string, string>
	itineraryId: string
	amount: string
	hid: string | null
}

const statusColors: Record<string, string> = {
	"CONFIRMED": 'bg-green-100 text-green-800',
	"CANCELED": 'bg-red-100 text-red-800',
	"PENDING": 'bg-yellow-100 text-yellow-800',
	"default": 'bg-yellow-100 text-yellow-800'
};

export default ({ id, type, status, details, itineraryId, amount, hid }: BookingCardProps) => {
	const { accessToken } = useContext(AuthContext)!;
	const [canceled, setCanceled] = useState(status == 'CANCELED');

	return (
		<div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
			<div className="flex justify-between items-start mb-3 md:mb-4">
				<span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm truncate ${statusColors[status] || statusColors.default}`}>
					{status}
				</span>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 break-words">
				{/* Column 1 */}
				<div className="space-y-1 md:space-y-2">
					<p><span className="font-medium">booking id:</span> {id}</p>
					<p><span className="font-medium">type:</span> {type}</p>
				</div>
				
				{/* Column 2 */}
				<div className="space-y-1 md:space-y-2">
					{
						details &&
						Object.entries(details).map(([k, v]) => (
							<p key={k}><span className="font-medium">{k}:</span> {v}</p>
						))
					}
				</div>
			</div>

			<div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 flex flex-col md:flex-row justify-end gap-y-2 md:gap-3">
				{
					!hid &&
					<button
						onClick={() => {
							const doc = new jsPDF();
							doc.text("itinerary id: " + itineraryId, 10, 10);
							doc.text("amount: " + amount, 10, 20);
							doc.save(`invoice.pdf`);
						}}
						className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
					>
						<DocumentArrowDownIcon className="w-4 h-4 md:w-5 md:h-5" />
						<span className="text-sm md:text-base">Download</span>
					</button>
				}
				
				
				{
					!canceled && 
					<button
						onClick={() => {
							if (hid) {
								fetch(`/api/hotel/${hid}/booking`, {
									method: "PATCH",
									headers: {
										'Authorization': `Bearer ${accessToken}` // Add authorization header
									},
									body: JSON.stringify({
										bookingIds: [id]
									})
								})
								.then(res => {
									if (res.ok) setCanceled(true);
								});
								return;
							}
							fetch('/api/booking/' + id, {
								method: "PATCH",
								headers: {
									'Authorization': `Bearer ${accessToken}` // Add authorization header
								}
							})
							.then(res => {
								if (res.ok) setCanceled(true);
							});
						}}
						className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
					>
						<XCircleIcon className="w-4 h-4 md:w-5 md:h-5" />
						<span className="text-sm md:text-base">Cancel</span>
					</button>
				}
			</div>
		</div>
	);
};