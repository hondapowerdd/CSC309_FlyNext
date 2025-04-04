import { useState, useContext } from 'react';
import { AuthContext } from "@/frontend/contexts/auth";
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

type RoomType = 'SINGLE' | 'DOUBLE' | 'SUITE' | 'DELUXE';

export default ({ hid, existingRoomTypes: existingRoomTypes, close }: { hid: string, existingRoomTypes: string[], close: () => void }) => {
	console.log(hid);

	const { accessToken } = useContext(AuthContext)!;

	const [name, setName] = useState('');
	const [type, setType] = useState<RoomType>('SINGLE');
	const [amenities, setAmenities] = useState('');
	const [pricePerNight, setPricePerNight] = useState('');
	const [availability, setAvailability] = useState('');
	const [images, setImages] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length > 0) {
		setImages(prev => [...prev, ...files]);
		setPreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
		}
	};

	const removeImage = (index: number) => {
		setImages(prev => prev.filter((_, i) => i !== index));
		setPreviews(prev => prev.filter((_, i) => i !== index));
	};

	const submit = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData();
		
		formData.append('name', name);
		formData.append('type', type);
		formData.append('amenities', amenities);
		formData.append('pricePerNight', pricePerNight);
		formData.append('availability', availability);
		
		images.forEach((image, index) => {
		formData.append(`images`, image);
		});

		fetch(`/api/hotel/${hid}/room`, {
			method: "POST",
			body: formData, // Send the FormData as body
			headers: {
				'Authorization': `Bearer ${accessToken}` // Add authorization header
			}
		})
		.then(res => {
			if (!res.ok) close();
		});
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
		<div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
			<div className="flex justify-between items-center border-b p-4">
			<h2 className="text-xl font-semibold text-blue-900">Add New Room Type</h2>
			<button
				onClick={close}
				className="text-gray-500 hover:text-gray-700 text-2xl"
				aria-label="Close"
			>
				&times;
			</button>
			</div>

			<form onSubmit={submit} className="p-4 space-y-4">
			{/* Basic Info */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Room Name *
				</label>
				<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
					required
				/>
				</div>

				<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Room Type *
				</label>
					<select
						value={type}
						onChange={(e) => setType(e.target.value as RoomType)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
					>
						{['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'].filter(type => !existingRoomTypes.includes(type)).map((type) => (
						<option key={type} value={type}>
							{type.charAt(0) + type.slice(1).toLowerCase()}
						</option>
						))}
					</select>
				</div>
			</div>

			{/* Price and Availability */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Price Per Night ($) *
				</label>
				<input
					type="number"
					value={pricePerNight}
					onChange={(e) => setPricePerNight(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
					min="0"
					step="0.01"
					required
				/>
				</div>

				<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Available Rooms *
				</label>
				<input
					type="number"
					value={availability}
					onChange={(e) => setAvailability(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
					min="0"
					required
				/>
				</div>
			</div>

			{/* Amenities */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
				Amenities
				</label>
				<input
				type="text"
				value={amenities}
				onChange={(e) => setAmenities(e.target.value)}
				className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
				placeholder="e.g., WiFi, TV, Air Conditioning"
				/>
			</div>

			{/* Image Upload */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
				Room Images (max 5)
				</label>
				<div className="flex flex-wrap gap-4">
				{previews.map((preview, index) => (
					<div key={index} className="relative group">
					<img
						src={preview}
						alt={`Preview ${index + 1}`}
						className="w-32 h-32 object-cover rounded-lg"
					/>
					<button
						type="button"
						onClick={() => removeImage(index)}
						className="absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-white transition-colors"
					>
						<XMarkIcon className="w-5 h-5 text-red-600" />
					</button>
					</div>
				))}
				{previews.length < 5 && (
					<label className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-blue-200 cursor-pointer hover:border-blue-400 transition-colors">
					<CameraIcon className="w-8 h-8 text-blue-400" />
					<input
						type="file"
						accept="image/*"
						onChange={handleImageUpload}
						className="hidden"
						multiple
					/>
					</label>
				)}
				</div>
			</div>

			{/* Submit Button */}
			<div className="border-t pt-4">
				<button
				type="submit"
				className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
				>
				Add Room Type
				</button>
			</div>
			</form>
		</div>
		</div>
	);
};