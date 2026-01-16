"use client";

import { useEffect, useState } from "react";
import { getCookingProjects } from "@/app/actions/kitchen";

export default function TestPage() {
    const [result, setResult] = useState<string>("Loading...");

    useEffect(() => {
        getCookingProjects().then(res => {
            setResult("Success: " + JSON.stringify(res));
        }).catch(err => {
            setResult("Error: " + err.message);
        });
    }, []);

    return <div>{result}</div>;
}
