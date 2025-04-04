"use client";

import { useState, useEffect, useContext } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import { AuthContext } from "@/frontend/contexts/auth";

export default () => {
	const { uid, accessToken } = useContext(AuthContext)!;
	// console.log(uid);

	const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [profileImg, setProfileImg] = useState<File | null>(null);
	const [profileImgPreview, setProfileImgPreview] = useState<string | undefined>(undefined);
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (!uid) return;
		fetch('/api/' + uid, {
			method: "GET",
			headers: {
				'Authorization': `Bearer ${accessToken}` // Add authorization header
			}
		})
		.then(res => {
			res.json()
			.then(resContent => {
				if (!res.ok) return;
				const user = resContent.profile;
				setFirstName(user.firstName || "");
				setLastName(user.lastName || "");
				setEmail(user.email || "");
				setPhone(user.phone || "");
				
			});
		});
	}, [uid]);

    const updateProfileImg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
			setProfileImg(file);
			setProfileImgPreview(URL.createObjectURL(file));
		}
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
		const formData = new FormData();
		formData.append("firstName", firstName);
		formData.append("lastName", lastName);
		formData.append("email", email);
		formData.append("phoneNumber", phone);

		if (profileImg) formData.append("profilePic", profileImg);

        fetch('/api/' + uid, {
			method: "PATCH",
			headers: {
				'Authorization': `Bearer ${accessToken}` // Add authorization header
			},
			body: formData
		})
		.then(res => {
			if (res.ok) setMessage("Profile updated.");
			else setMessage("Update failed. Please try again");
		});
    };

    return (
		<div className="min-h-screen bg-gray-50 p-4 md:p-8">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-2xl font-bold text-blue-900 mb-6">Update Profile</h1>

				<form onSubmit={submit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
					{/* Profile Picture Upload */}
					<div className="flex flex-col items-center">
						<div className="relative w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-blue-200">
							{profileImg ? (
								<img 
									src={profileImgPreview} 
									alt="Profile" 
									className="w-full h-full rounded-full object-cover"
								/>
							) : (
								<div className="w-full h-full rounded-full bg-gray-200" />
							)}
							<label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-sm cursor-pointer hover:bg-blue-50 transition-colors">
								<CameraIcon className="w-6 h-6 text-blue-600" />
								<input
									type="file"
									accept="image/*"
									onChange={updateProfileImg}
									className="hidden"
								/>
							</label>
						</div>
					</div>

					{/* Name Fields */}
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								First Name
							</label>
							<input
								type="text"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
								required
							/>
						</div>
						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Last Name
							</label>
							<input
								type="text"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
								required
							/>
						</div>
					</div>

					{/* Email */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Email
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							required
						/>
					</div>

					{/* Phone Number */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Phone Number
						</label>
						<input
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							pattern="[0-9]{10}"
							title="10-digit phone number"
						/>
					</div>

					{message && (
						<div className={`p-3 rounded-md ${
							message.includes("updated") 
								? "bg-green-100 text-green-800" 
								: "bg-red-100 text-red-800"
							}`}>
							{message}
						</div>
					)}

					{/* Submit Button */}
					<div className="border-t pt-6">
						<div className="flex justify-center">
							<button
								type="submit"
								className="w-full md:w-1/2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
							>
								Update Profile
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
    );
}