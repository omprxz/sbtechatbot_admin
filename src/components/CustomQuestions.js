"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import QuestionCard from "@/components/QuestionCard"; // The component for displaying individual questions

const CustomQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true); // Loading state
    const limit = 10;

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true); // Set loading to true before the request
            try {
                const response = await axios.get(`/api/custom?page=${page}&limit=${limit}`);
                setQuestions(response.data.questions);
                setTotalPages(Math.ceil(response.data.totalCount / limit)); // Update this as per your API response
            } catch (error) {
                console.error('Failed to fetch custom questions:', error);
            } finally {
                setLoading(false); // Set loading to false after the request
            }
        };

        fetchQuestions();
    }, [page]);

    const handleUpdate = async (id, updatedData) => {
        try {
            await axios.put(`/api/questions/${id}`, updatedData);
            setQuestions(prevQuestions => prevQuestions.map(q => (q.id === id ? { ...q, ...updatedData } : q)));
        } catch (error) {
            console.error('Failed to update question:', error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this question?")) {
            try {
                await axios.delete(`/api/questions/${id}`);
                setQuestions(questions.filter(q => q.id !== id));
            } catch (error) {
                console.error('Failed to delete question:', error);
            }
        }
    };

    return (
        <div>
            {loading ? (
                <p>Loading custom questions...</p> // Show loading state
            ) : questions.length === 0 ? (
                <p>No custom questions available.</p>
            ) : (
                questions.map(question => (
                    <QuestionCard 
                        key={question.id} 
                        question={question} 
                        onUpdate={handleUpdate} 
                        onDelete={handleDelete}  
                    />
                ))
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

export default CustomQuestions;
