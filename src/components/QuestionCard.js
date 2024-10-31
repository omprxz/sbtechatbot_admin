"use client";

import { useState } from "react";

const QuestionCard = ({ question, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [updatedQuestion, setUpdatedQuestion] = useState(question.question);
    const [updatedAnswer, setUpdatedAnswer] = useState(question.answer);
    const [updatedStatus, setUpdatedStatus] = useState(question.status);
    const [loading, setLoading] = useState(false); // Loading state for updates

    const handleUpdate = async () => {
        setLoading(true); // Set loading to true when updating starts
        await onUpdate(question.id, {
            question: updatedQuestion,
            answer: updatedAnswer,
            status: updatedStatus
        });
        setLoading(false); // Set loading to false when updating ends
        setIsEditing(false);
    };

    return (
        <div className="card bg-base-100 shadow-md p-4 mb-4">
            <div className="card-body">
                {isEditing ? (
                    <>
                        <input 
                            type="text" 
                            value={updatedQuestion} 
                            onChange={(e) => setUpdatedQuestion(e.target.value)} 
                            className="input input-bordered w-full mb-2"
                        />
                        <textarea 
                            value={updatedAnswer} 
                            onChange={(e) => setUpdatedAnswer(e.target.value)} 
                            className="textarea textarea-bordered w-full mb-2"
                        />
                        <select 
                            value={updatedStatus} 
                            onChange={(e) => setUpdatedStatus(e.target.value)} 
                            className="select select-bordered w-full mb-2"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <button onClick={handleUpdate} className={`btn btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'} {/* Change button text based on loading state */}
                        </button>
                        <button onClick={() => setIsEditing(false)} className="btn btn-secondary ml-2" disabled={loading}>
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <h2 className="card-title">{question.question}</h2>
                        <p><strong>Answer:</strong> {question.answer}</p>
                        <p><strong>Status:</strong> {question.status}</p>
                        <p><strong>Created At:</strong> {new Date(question.created_at).toLocaleDateString()}</p>
                        <p><strong>Created By:</strong> {question?.created_by_name || 'Unknown'}</p>
                        <div className="card-actions justify-end mt-4">
                            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit</button>
                            <button className={`btn btn-error ${loading ? 'loading' : ''}`} onClick={() => onDelete(question.id)} disabled={loading}>
                                Delete
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default QuestionCard;
