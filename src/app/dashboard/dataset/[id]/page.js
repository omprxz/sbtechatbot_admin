"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const DatasetPage = ({ params }) => {
    const router = useRouter();
    const { id } = React.use(params);
    const [questions, setQuestions] = useState([]);
    const [dataset, setDataset] = useState({});
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [loadingQuestions, setLoadingQuestions] = useState(true); // Loading state for questions
    const [loadingCategories, setLoadingCategories] = useState(true); // Loading state for categories
    const [loadingUpdate, setLoadingUpdate] = useState(false); // Loading state for updates

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoadingQuestions(true);
            try {
                const response = await axios.get(`/api/dataset/${id}`);
                setQuestions(response.data.questions || []);
                setDataset(response.data.dataset);
            } catch (error) {
                setError('Failed to fetch questions.');
            } finally {
                setLoadingQuestions(false);
            }
        };

        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await axios.get('/api/categories');
                setCategories(response.data.categories || []);
            } catch (error) {
                console.error('Failed to fetch categories.');
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchQuestions();
        fetchCategories();
    }, [id]);

    const handleUpdateQuestion = async (questionId, updatedQuestion) => {
        setLoadingUpdate(true); // Start loading when updating a question
        try {
            await axios.put(`/api/questions/${questionId}`, updatedQuestion);
            setQuestions(prevQuestions =>
                prevQuestions.map(question =>
                    question.id === questionId ? { ...question, ...updatedQuestion } : question
                )
            );
        } catch (error) {
            setError('Failed to update question.');
        } finally {
            setLoadingUpdate(false); // Reset loading state
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (confirm("Are you sure you want to delete this question?")) {
            try {
                await axios.delete(`/api/questions/${questionId}`);
                setQuestions(questions.filter(question => question.id !== questionId));
            } catch (error) {
                setError('Failed to delete question.');
            }
        }
    };

    const toggleEditMode = (questionId) => {
        setQuestions(prevQuestions =>
            prevQuestions.map(question =>
                question.id === questionId ? { ...question, isEditing: !question.isEditing } : question
            )
        );
    };

    const handleCategoryChange = async (e) => {
        setDataset({ ...dataset, category: e.target.value });
        try {
            if (e.target.value === '') {
                await axios.post('/api/dataset/patch', { id, action: 'categoryToNull' });
            } else {
                await axios.post('/api/dataset/patch', { id, action: 'category', category: e.target.value });
            }
        } catch (error) {
            setError('Failed to update category.');
        }
    };

    const handleStatusUpdate = async (e) => {
        setDataset({ ...dataset, status: e.target.value });
        try {
            await axios.post('/api/dataset/patch', { id, action: 'status', status: e.target.value });
        } catch (error) {
            setError('Failed to update status.');
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this dataset?")) {
            try {
                await axios.post('/api/dataset/patch', { id, action: 'delete' });
                router.push('/dashboard/dataset');
            } catch (error) {
                setError('Failed to delete dataset.');
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex md:flex-row flex-col items-center justify-center md:justify-around mb-4">
                <div className="flex flex-col items-center justify-center gap-2">
                    <p>Category</p>
                    <select
                        name="category"
                        className="select select-bordered w-full mb-2"
                        value={dataset.category}
                        onChange={handleCategoryChange}
                    >
                        <option value="">No categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                    <p>Status</p>
                    <select
                        name="status"
                        className="select select-bordered w-full mb-2"
                        value={dataset.status}
                        onChange={handleStatusUpdate}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div>
                    <button className="btn btn-error btn-md" onClick={handleDelete}>Delete</button>
                </div>
            </div>
            {error && <p className="text-red-600">{error}</p>}
            <h2 className="text-xl font-bold my-4">Questions</h2>
            {loadingQuestions || loadingCategories ? ( // Show loading state if either is loading
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {questions.length === 0 ? (
                        <div className="col-span-full text-center">
                            <p>No questions available.</p>
                        </div>
                    ) : (
                        questions.map(question => (
                            <div key={question.id} className="card bg-base-100 shadow-md p-4">
                                <div className="card-body">
                                    {question.isEditing ? (
                                        <>
                                            <textarea
                                                className="textarea textarea-bordered w-full mb-2"
                                                value={question.question}
                                                onChange={(e) => {
                                                    question.question = e.target.value;
                                                    setQuestions([...questions]);
                                                }}
                                            />
                                            <textarea
                                                className="textarea textarea-bordered w-full mb-2"
                                                value={question.answer}
                                                onChange={(e) => {
                                                    question.answer = e.target.value;
                                                    setQuestions([...questions]);
                                                }}
                                            />
                                            <select
                                                className="select select-bordered w-full mb-2"
                                                value={question.status}
                                                onChange={(e) => {
                                                    question.status = e.target.value;
                                                    setQuestions([...questions]);
                                                }}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-lg font-semibold">{question.question}</p>
                                            <p><strong>Answer:</strong> {question.answer}</p>
                                            <p><strong>Status:</strong> {question.status}</p>
                                        </>
                                    )}
                                    <div className="flex justify-between items-center mt-4">
                                        <div>
                                            <button
                                                className="btn btn-secondary btn-sm mr-2"
                                                onClick={() => {
                                                    if (question.isEditing) {
                                                        handleUpdateQuestion(question.id, {
                                                            question: question.question,
                                                            answer: question.answer,
                                                            status: question.status
                                                        });
                                                    }
                                                    toggleEditMode(question.id);
                                                }}
                                                disabled={loadingUpdate} // Disable button while updating
                                            >
                                                {question.isEditing ? 'Save' : 'Edit'}
                                            </button>
                                            <button
                                                className="btn btn-error btn-sm"
                                                onClick={() => handleDeleteQuestion(question.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default DatasetPage;
