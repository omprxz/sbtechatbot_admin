"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const ProfilePage = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [errorPassword, setErrorPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingProfileUpdate, setLoadingProfileUpdate] = useState(false); // Loading for profile update
    const [loadingPasswordChange, setLoadingPasswordChange] = useState(false); // Loading for password change
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('/api/user');
                setUser(response.data.user);
                setName(response.data.user.name);
                setEmail(response.data.user.email);
                setPhone(response.data.user.phone);
            } catch (error) {
                setError('Failed to fetch user data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoadingProfileUpdate(true); // Set loading state on profile update
        try {
            const response = await axios.put('/api/user', { name, email, phone });
            alert(response.data.message);
            if (response.status === 200) {
                setUser(prev => ({ ...prev, name, email, phone }));
                setError('');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoadingProfileUpdate(false); // Reset loading state
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoadingPasswordChange(true); // Set loading state on password change
        try {
            const response = await axios.patch('/api/user/change-pass', { oldPassword, newPassword });
            alert(response.data.message);
            if (response.status === 200) {
                setOldPassword('');
                setNewPassword('');
                setErrorPassword('');
            }
        } catch (error) {
            setErrorPassword(error.response?.data?.message || 'Failed to change password.');
        } finally {
            setLoadingPasswordChange(false); // Reset loading state
        }
    };

    if (loading) return <p>Loading...</p>; // Initial loading state

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            {error && <p className="text-red-600">{error}</p>}

            <form onSubmit={handleProfileUpdate} className="mb-8">
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-1">Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input input-bordered w-full"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-1">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input input-bordered w-full"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-1">Phone:</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input input-bordered w-full"
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loadingProfileUpdate}>
                    {loadingProfileUpdate ? 'Updating...' : 'Update Profile'}
                </button>
            </form>

            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            {errorPassword && <p className="text-red-600">{errorPassword}</p>}
            <form onSubmit={handlePasswordChange}>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-1">Old Password:</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="input input-bordered w-full"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-1">New Password:</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input input-bordered w-full"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loadingPasswordChange}>
                    {loadingPasswordChange ? 'Changing...' : 'Change Password'}
                </button>
            </form>

            <div className="mt-4">
                <h3 className="text-lg font-bold">User Info:</h3>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                <p><strong>Created At:</strong> {dayjs(user.created_at).format("DD MMM YYYY hh:mm A")}</p>
            </div>
        </div>
    );
};

export default ProfilePage;
