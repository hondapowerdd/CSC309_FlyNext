import { useRouter, usePathname } from 'next/navigation';

export default () => {
    const router = useRouter();
    const pathname = usePathname();

    const getButtonClass = (targetPath: string) =>
        pathname === targetPath
            ? "px-4 py-1 rounded-full bg-blue-300 text-blue-900 font-semibold transition-colors duration-200"
            : "px-4 py-1 rounded-full hover:bg-white hover:text-blue-900 transition-colors duration-200";

    return (
        <>
            <div className="bg-blue-900"> {/* Wrapper div */}
                {/* Gradient line */}
                <div className="mx-auto h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent via-blue-200/50 mb-2"></div>
                
                <nav className="text-white flex flex-col md:flex-row items-center justify-center md:gap-3 gap-y-1 py-1 md:py-2">
                    <button
                        className={`text-sm md:text-base ${getButtonClass('/hotel')}`}
                        onClick={() => router.push('/hotel')}
                    >
                        Hotel
                    </button>
                    <button
                        className={`text-sm md:text-base ${getButtonClass('/flight_search')}`}
                        onClick={() => router.push('/flight_search')}
                    >
                        Flights
                    </button>
                    <button
                        className={`text-sm md:text-base ${getButtonClass('/hotel_flight')}`}
                        onClick={() => router.push('/hotel_flight')}
                    >
                        Hotel + Flights
                    </button>
                </nav>
            </div>
        </>
    );
}