import { DocumentArrowDownIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface BookingCardProps {
	id: string;
	type: string;
	status: string;
	details: Record<string, string>
}

const statusColors: Record<string, string> = {
	"CONFIRMED": 'bg-green-100 text-green-800',
	"CANCELLED": 'bg-red-100 text-red-800',
	"PENDING": 'bg-yellow-100 text-yellow-800',
	"default": 'bg-yellow-100 text-yellow-800'
};

export default ({ id, type, status, details }: BookingCardProps) => {
	

	return (
		<div className="bag-white rounded-lg shadow-md p-6 mb-4 border border-gray-100 hover:shadow-lg transition-shadow">
		<div className="flex justify-between items-start mb-4">
			<span className={`px-3 py-1 rounded-full text-sm ${statusColors[status]? statusColors[status]:statusColors["default"]}`}>
				{status}
			</span>
		</div>

		<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
			<div className="space-y-2">
				<p><span className="font-medium">Booking ID:</span> {id}</p>
				<p><span className="font-medium">Booking Type:</span> {type}</p>
				{Object.keys(details).map(k => <p key={k}><span className="font-medium">{k}:</span> {details[k]}</p>)}
			</div>
		</div>

		<div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3">
			<button
			onClick={() => {}}
			className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
			>
				<DocumentArrowDownIcon className="w-5 h-5" />
				Download Invoice
			</button>
			
			{status !== 'CANCELLED' && (
			<button
				onClick={ () => {} }
				className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
			>
				<XCircleIcon className="w-5 h-5" />
				Cancel Booking
			</button>
			)}
		</div>
		</div>
	);
};