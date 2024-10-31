"use client";

import { useState } from "react";

const AddCustomQnA = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [status, setStatus] = useState('active');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (!question) {
            setError('Question is required.');
            setIsLoading(false);
            return;
        }

        const response = await fetch('/api/add-qnas/custom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ question, answer, status }),
        });

        const data = await response.json();
        if (response.ok) {
            setSuccess(data.message);
            setQuestion('');
            setAnswer('');
            setStatus('active');
            setTimeout(() => setSuccess(''), 5000);
        } else {
            setError(data.message);
            setTimeout(() => setError(''), 5000);
        }
        setIsLoading(false);
    };

    return (
        <div className="flex justify-center bg-base-200 pt-5">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Add Custom QnA</h2>
                {error && <p className="mt-4 text-red-600">{error}</p>}
                {success && <p className="mt-4 text-green-600">{success}</p>}
                <form onSubmit={handleSubmit} className="mt-6">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Question</span>
                        </label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="input input-bordered"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-control mt-4">
                        <label className="label">
                            <span className="label-text">Answer</span>
                        </label>
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="textarea textarea-bordered"
                            placeholder="Optional"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-control mt-4">
                        <label className="label">
                            <span className="label-text">Status</span>
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="select select-bordered"
                            disabled={isLoading}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-6" disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Add QnA'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddCustomQnA;
