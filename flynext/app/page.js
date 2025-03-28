import SearchBox from "./components/home/SearchBox";

export default function HomePage() {
    return (
        <div>
            <div className="relative">
                <img src={null} alt="Hero" className="w-full h-96 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white">
                    <h1 className="text-3xl font-bold">flynext</h1>
                    <p className="mt-2">good</p>
                    <button className="mt-4 px-4 py-2 bg-blue-600 rounded">book now</button>
                </div>
            </div>
            <div className="px-6">
                <SearchBox />
                {/* Add other sections like <RecentSearches /> here */}
            </div>
        </div>
    );
}
