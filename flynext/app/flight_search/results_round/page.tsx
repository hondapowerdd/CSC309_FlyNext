import { Suspense } from "react";
import Client from "./Client";

export default function Page() {
    return (
        <Suspense fallback={<div className="p-8">Loading round-trip search...</div>}>
            <Client />
        </Suspense>
    );
}
