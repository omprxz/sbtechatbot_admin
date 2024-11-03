"use client";

import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useState } from "react";

const DatasetCard = ({ dataset, categories, onUpdate, onDelete }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleUpdateCategory = async (category) => {
        setLoading(true);
        await onUpdate(dataset.id, 'category', category);
        setLoading(false);
    };

    const handleUpdateStatus = async (status) => {
        setLoading(true);
        await onUpdate(dataset.id, 'status', status);
        setLoading(false);
    };

    return (
        <div className="card bg-base-100 shadow-md p-4">
            <div className="card-body">
                <h2 className="card-title">{dataset.name}</h2>
                <p className="uppercase"><strong>Type:</strong> {dataset.type}</p>
                <p><strong>Size:</strong> {(dataset.size / 1024).toFixed(2)} KB</p>
                <p><strong>Created By:</strong> {dataset.created_by_name}</p>
                <p><strong>Created At:</strong> {dayjs(dataset.created_at).format("DD MMM YYYY hh:mm A")}</p>
                {dataset?.access_link && <p><strong>Access Link:</strong> 
                    <a 
                        href={dataset.access_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 underline ml-1"
                    >
                        {dataset.access_link}
                    </a>
                </p>}

                {/* Category Dropdown */}
                <div className="my-2">
                    <label className="block text-sm font-bold mb-1">Update Category</label>
                    <select
                        className="select select-bordered w-full"
                        value={dataset.category}
                        onChange={(e) => handleUpdateCategory(e.target.value)}
                        disabled={loading}
                    >
                        <option disabled value="">Select a category</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* Status Dropdown */}
                <div className="my-2">
                    <label className="block text-sm font-bold mb-1">Update Status</label>
                    <select
                        className="select select-bordered w-full"
                        value={dataset.status}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        disabled={loading}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>
            <div className="card-actions justify-start mt-4 flex flex-wrap gap-2">
                <button
                    className={`btn btn-error btn-sm ${loading ? 'loading' : ''}`}
                    onClick={async () => {
                        if (confirm("Are you sure you want to delete this dataset?")) {
                            setLoading(true);
                            await onDelete(dataset.id);
                            setLoading(false);
                        }
                    }}
                    disabled={loading}
                >
                    Delete
                </button>
                <button
                    className={`btn btn-primary btn-sm ${loading ? 'loading' : ''}`}
                    onClick={() => router.push(`/dashboard/dataset/${dataset.id}`)}
                    disabled={loading}
                >
                    Update
                </button>
            </div>
        </div>
    );
};

export default DatasetCard;
