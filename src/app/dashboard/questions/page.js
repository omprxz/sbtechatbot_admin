"use client";

import { useState, useEffect } from "react";
import AllQuestions from "@/components/AllQuestions";
import CustomQuestions from "@/components/CustomQuestions";

const QuestionPage = () => {
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(true); // Loading state for the page

    // Effect to reset loading state when the active tab changes
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 300); // Simulate loading time for demo purposes; you can adjust or remove this

        return () => clearTimeout(timer);
    }, [activeTab]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Questions</h1>
            <div role="tablist" className="tabs tabs-bordered mb-4">
                <a 
                    role="tab" 
                    className={`tab ${activeTab === "all" ? "tab-active" : ""}`} 
                    onClick={() => setActiveTab("all")}
                >
                    All
                </a>
                <a 
                    role="tab" 
                    className={`tab ${activeTab === "custom" ? "tab-active" : ""}`} 
                    onClick={() => setActiveTab("custom")}
                >
                    Custom
                </a>
            </div>

            <div>
                {loading ? ( // Loading state
                    <p>Loading questions...</p>
                ) : (
                    <>
                        {activeTab === "all" && <AllQuestions />}
                        {activeTab === "custom" && <CustomQuestions />}
                    </>
                )}
            </div>
        </div>
    );
};

export default QuestionPage;
