"use client";

import { useState } from "react";
import AddDataset from "@/components/AddDataset"; // Adjust the path as necessary
import AddCustomQnA from "@/components/AddCustomQnA"; // Adjust the path as necessary

const AddPage = () => {
    const [activeTab, setActiveTab] = useState("dataset");

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="p-4 bg-base-200 min-h-screen transition-all duration-300 ease-in-out">
            <h1 className="text-3xl font-bold text-center mb-6">Add New Data</h1>
            
            <div role="tablist" className="tabs tabs-bordered mb-2">
                <a 
                    role="tab" 
                    className={`tab ${activeTab === "dataset" ? "tab-active" : ""}`} 
                    onClick={() => handleTabChange("dataset")}
                >
                    Dataset
                </a>
                <a 
                    role="tab" 
                    className={`tab ${activeTab === "custom" ? "tab-active" : ""}`} 
                    onClick={() => handleTabChange("custom")}
                >
                    Custom
                </a>
            </div>

            <div className="mt-6 transition-opacity duration-500">
                {activeTab === "dataset" && <AddDataset />}
                {activeTab === "custom" && <AddCustomQnA />}
            </div>
        </div>
    );
};

export default AddPage;
