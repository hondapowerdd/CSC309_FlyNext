export default function SearchBox() {
    return (
        <div className="bg-white shadow-lg p-4 mt-4 rounded-lg flex flex-wrap gap-4">
            <input type="text" placeholder="Where are you going?" className="flex-1 p-2 border rounded" />
            <input type="text" placeholder="Select dates" className="flex-1 p-2 border rounded" />
            <input type="text" placeholder="Guests" className="flex-1 p-2 border rounded" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
        </div>
    );
}
