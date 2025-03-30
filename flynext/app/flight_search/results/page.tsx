"use client";

import { Suspense } from "react";
import FlightResultsClient from "./FlightResultsClient";

export const dynamic = "force-dynamic";

export default function FlightSearchResultsPage() {
    return (
        <Suspense fallback={<p>Loading flight results...</p>}>
            <FlightResultsClient />
        </Suspense>
    );
}
