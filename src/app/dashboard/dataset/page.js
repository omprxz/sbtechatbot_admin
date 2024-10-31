"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DatasetCard from "@/components/DatasetCard";

const ViewDatasets = () => {
    const router = useRouter();
    const [datasets, setDatasets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;
    const [loadingDatasets, setLoadingDatasets] = useState(true); // Loading state for datasets
    const [loadingCategories, setLoadingCategories] = useState(true); // Loading state for categories

    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true); // Start loading categories
            try {
                const response = await axios.get('/api/categories');
                setCategories(response.data.categories || []);
            } catch (error) {
                console.error('Failed to fetch categories.');
            } finally {
                setLoadingCategories(false); // Reset loading state
            }
        };

        const fetchDatasets = async () => {
            setLoadingDatasets(true); // Start loading datasets
            try {
                const response = await axios.get(`/api/dataset?page=${page}&limit=${limit}`);
                setDatasets(response.data.files.map(dataset => ({
                    ...dataset,
                    category: dataset.category || "No Category"
                })));
                setTotalPages(response.data.totalPages);
            } catch (error) {
                setError('Failed to fetch datasets.');
            } finally {
                setLoadingDatasets(false); // Reset loading state
            }
        };

        fetchCategories();
        fetchDatasets();
    }, [page]);

    const handleUpdate = async (id, action, value) => {
        try {
            await axios.post('/api/dataset/patch', { id, action, [action]: value });
            setDatasets(prevDatasets => 
                prevDatasets.map(dataset => dataset.id === id ? { ...dataset, [action]: value } : dataset)
            );
        } catch (error) {
            setError(`Failed to update ${action}.`);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this dataset?")) {
            try {
                await axios.post('/api/dataset/patch', { id, action: 'delete' });
                setDatasets(datasets.filter(dataset => dataset.id !== id));
            } catch (error) {
                setError('Failed to delete dataset.');
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-center mb-4">
                <Link className="btn btn-primary mx-auto mb-4" href="/dashboard/add">Add Dataset</Link>
            </div>
            <h1 className="text-2xl font-bold mb-4">View Datasets</h1>
            {error && <p className="text-red-600">{error}</p>}

            {loadingDatasets || loadingCategories ? ( // Show loading state if either is loading
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {datasets.length === 0 ? (
                        <div className="col-span-full text-center">
                            <p>No datasets available.</p>
                        </div>
                    ) : (
                        datasets.map(dataset => (
                            <DatasetCard
                                key={dataset.id}
                                dataset={dataset}
                                categories={categories}
                                onUpdate={handleUpdate}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            <div className="mt-4 flex justify-between items-center">
                <button
                    className="btn btn-secondary"
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span className="text-lg">Page {page} of {totalPages}</span>
                <button
                    className="btn btn-secondary"
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ViewDatasets;
