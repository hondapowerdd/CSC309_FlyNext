import Navbar from "./components/Navbar";
import SearchBox from "./components/SearchBox";

export default function HomePage() {
    return (
        <div>
            <Navbar />
            <div className="relative">
                <img src="/hero.jpg" alt="Hero" className="w-full h-96 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white">
                    <h1 className="text-3xl font-bold">本田就是牛逼</h1>
                    <p className="mt-2">订勾巴机票</p>
                    <button className="mt-4 px-4 py-2 bg-blue-600 rounded">book shit</button>
                </div>
            </div>
            <div className="px-6">
                <SearchBox />
                {/* Add other sections like <RecentSearches /> here */}
            </div>
        </div>
    );
}
