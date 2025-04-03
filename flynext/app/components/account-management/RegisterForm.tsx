import React, { useState, useContext, useEffect, FormEvent } from "react";
import { AuthContext, saveCookies } from "@/frontend/contexts/auth";

export default ({ close }: { close: () => void }) => {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [password, setPassword] = useState("");

	const [res, setRes] = useState<string | null>(null);

	const [submitDisabled, setSubmitDisabled] = useState(true);
	useEffect(() => {
		const newStatus = !/\S+@\S+\.\S+/.test(email) ||
		!password ||
		Boolean(phoneNumber && Number.isNaN(Number(phoneNumber)));
		if (submitDisabled !== newStatus) setSubmitDisabled(newStatus);
	}, [email, password, phoneNumber]);

	const { setUid, setAccessToken, setRefreshToken } = useContext(AuthContext)!;

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		fetch(
			"/api/account/register",
			{
				method: "POST",
				body: JSON.stringify({
					registration: {
						firstName,
						lastName,
						email,
						phoneNumber,
						password
					}
				})
			}
		)
		.then(res => {
			res.json()
			.then(resContent => {
				if (!res.ok) {
					setRes(resContent.error)
					return setSubmitted(true);
				}
				setRes(`Please carefully record the following unique identifier for future login:\n${resContent.uid}`);
				const cookies = {
                    uid: resContent.uid,
                    ...(resContent.tokens)
                }
				setUid(cookies.uid);
				setAccessToken(cookies.accessToken);
				setRefreshToken(cookies.refreshToken);
                saveCookies(cookies);
				setSubmitted(true);
			});
		});
		// .catch(e => {
		// 	console.log(e);
		// });
	};

	const [submitted, setSubmitted] = useState(false);

	const closeBtn = (
		<button 
			type="button" 
			className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
			onClick={close}
			aria-label="Close"
		>
			&times;
		</button>
	);

	if (submitted) return (
		<div className="relative w-full max-w-md bg-white rounded-lg shadow-md p-6 mx-auto">
			{closeBtn}
			<p className="text-gray-700">
				{res}
			</p>
		</div>
	);

	return (
		<div className="relative w-full max-w-md bg-white rounded-lg shadow-md p-6 mx-auto">

			{closeBtn}
		
			<h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
		
			<form className="space-y-4" onSubmit={submit}>
				{/* Name Fields */}
				<div className="flex flex-col sm:flex-row sm:gap-4">
				<div className="flex-1">
					<label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
					First Name
					</label>
					<input
						type="text"
						id="firstName"
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 transition-all"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
					/>
				</div>
				<div className="flex-1 mt-4 sm:mt-0">
					<label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
					Last Name
					</label>
					<input
						type="text"
						id="lastName"
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 transition-all"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
					/>
				</div>
				</div>
		
				{/* Email Field */}
				<div>
				<label htmlFor="email" className="block text-sm font-medium text-gray-700">
					Email
				</label>
				<input
					type="email"
					id="email"
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 transition-all"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					autoComplete="email"
					required
					placeholder="Valid email required"
				/>
				</div>
		
				{/* Phone Number Field */}
				<div>
				<label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
					Phone Number
				</label>
				<input
					type="tel"
					id="phoneNumber"
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 transition-all"
					value={phoneNumber}
					onChange={(e) => setPhoneNumber(e.target.value)}
					pattern="[0-9]{10}"
					title="10-digit phone number"
					placeholder="10-digit phone number"
				/>
				</div>
		
				{/* Password Field */}
				<div>
				<label htmlFor="password" className="block text-sm font-medium text-gray-700">
					Password
				</label>
				<input
					type="password"
					id="password"
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 transition-all"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					autoComplete="new-password"
					required
				/>
				</div>
		
				{/* Submit Button */}
				<div>
				<button
					type="submit"
					className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
					disabled={submitDisabled}
				>
					Register
				</button>
				</div>
			</form>
		</div>
	);
};

// export default RegisterForm;