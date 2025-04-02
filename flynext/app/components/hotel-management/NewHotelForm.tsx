"use client";

import { useState, useContext } from 'react';
import { AuthContext } from "@/frontend/contexts/auth";

export default ({ close }: { close: () => void }) => {
	const { accessToken } = useContext(AuthContext)!;

	const [name, setName] = useState('');
	const [address, setAddress] = useState('');
	const [city, setCity] = useState('');
	const [logo, setLogo] = useState<File | null>(null);
	const [starRating, setStarRating] = useState<number>(0);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);

	const updateLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
		setLogo(file);
		setLogoPreview(URL.createObjectURL(file));
		}
	};

	const submit = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('name', name);
		if (address) formData.append('address', address);
		formData.append('city', city);
		if (starRating) formData.append('starRating', starRating.toString());
		if (logo) formData.append('logo', logo);
		fetch('/api/hotel', {
			method: "POST",
			body: formData, // Send the FormData as body
			headers: {
				'Authorization': `Bearer ${accessToken}` // Add authorization header
			}
		})
		.then(response => close());
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
		<div className="bg-white rounded-lg shadow-xl w-full max-w-md">
			<div className="flex justify-between items-center border-b p-4">
			<h2 className="text-xl font-semibold text-blue-900">Add Your Hotel</h2>
			<button
				onClick={close}
				className="text-gray-500 hover:text-gray-700 text-2xl"
				aria-label="Close"
			>
				&times;
			</button>
			</div>

			<form onSubmit={submit} className="p-4 space-y-4">
				{/* Logo Upload */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
					Hotel Logo
					</label>
					<div className="flex items-center justify-center w-full">
					<label className="flex flex-col items-center px-4 py-6 bg-white text-blue-900 rounded-lg border-2 border-dashed border-blue-200 cursor-pointer hover:border-blue-400 transition-colors">
						{logoPreview ? (
						<img 
							src={logoPreview} 
							alt="Logo preview" 
							className="h-20 w-20 object-contain mb-2"
						/>
						) : (
						<svg
							className="w-12 h-12 text-blue-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						)}
						<span className="mt-2 text-sm">Upload logo</span>
						<input
						type="file"
						accept="image/*"
						onChange={updateLogo}
						className="hidden"
						/>
					</label>
					</div>
				</div>

				{/* Hotel Name */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
					Hotel Name
					</label>
					<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
					required
					/>
				</div>

				{/* Address */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
					Address
					</label>
					<input
					type="text"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
					/>
				</div>

				{/* City */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
					City
					</label>
					<input
					type="text"
					value={city}
					onChange={(e) => setCity(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
					required
					/>
				</div>

				{/* Star Rating */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
					Star Rating
					</label>
					<div className="flex gap-2">
					{[1, 2, 3, 4, 5].map((rating) => (
						<button
						key={rating}
						type="button"
						onClick={() => setStarRating(rating)}
						className={`w-10 h-10 rounded-full flex items-center justify-center 
							${starRating >= rating 
							? 'bg-blue-600 text-white' 
							: 'bg-gray-100 text-gray-500 hover:bg-blue-100'}`}
						>
						{rating}
						</button>
					))}
					</div>
				</div>

				{/* Submit Button */}
				<div className="border-t pt-4">
					<button
					type="submit"
					className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
					>
					Add Hotel
					</button>
				</div>
			</form>
		</div>
		</div>
	);
};