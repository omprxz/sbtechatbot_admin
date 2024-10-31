"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { IoClose, IoHome, IoReorderThree } from "react-icons/io5";

const Navbar = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include',
        });
        if (response.ok) {
            router.push('/login');
        }
    };

    const handleLinkClick = () => {
        if (isOpen) {
            setIsOpen(false);
        }
    };

    return (
        <nav className="bg-base-200 shadow">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
                <div className="text-lg font-bold text-black">
                    <Link href="/dashboard"><IoHome className="text-2xl" title="Home" /></Link>
                </div>
                <div className="hidden md:flex space-x-4">
                    <Link href="/dashboard/add" className="btn btn-ghost text-black" onClick={handleLinkClick}>Add Question</Link>
                    <Link href="/dashboard/dataset" className="btn btn-ghost text-black" onClick={handleLinkClick}>View Datasets</Link>
                    <Link href="/dashboard/questions" className="btn btn-ghost text-black" onClick={handleLinkClick}>View Questions</Link>
                    <Link href="/dashboard/profile" className="btn btn-ghost text-black" onClick={handleLinkClick}>Profile</Link>
                    <button onClick={handleLogout} className="btn btn-error text-white">Logout</button>
                </div>
                <div className="md:hidden">
                    <button
                        className="btn btn-ghost text-black"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? 
                        <IoClose className="text-3xl" /> :
                            <IoReorderThree className="text-3xl" />
                        }
                    </button>
                </div>
            </div>
            {isOpen && (
                <div className="md:hidden bg-base-200 pb-2">
                    <Link href="/dashboard/add" className="block px-4 py-2 text-black" onClick={handleLinkClick}>Add Question</Link>
                    <Link href="/dashboard/dataset" className="block px-4 py-2 text-black" onClick={handleLinkClick}>View Datasets</Link>
                    <Link href="/dashboard/questions" className="block px-4 py-2 text-black" onClick={handleLinkClick}>View Questions</Link>
                    <Link href="/dashboard/profile" className="block px-4 py-2 text-black" onClick={handleLinkClick}>Profile</Link>
                    <button onClick={handleLogout} className="block text-left px-6 py-2 btn btn-error text-white mx-auto my-5">Logout</button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
