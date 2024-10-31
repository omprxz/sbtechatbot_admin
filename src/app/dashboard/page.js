import Link from "next/link";

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
                
                <Card 
                    title="Add Question" 
                    description="Quickly add a new question to the system."
                    href="/dashboard/add"
                />
                
                <Card 
                    title="View Datasets" 
                    description="Access and manage all datasets here."
                    href="/dashboard/dataset"
                />
                
                <Card 
                    title="View Questions" 
                    description="Browse and manage questions."
                    href="/dashboard/questions"
                />
                
            </div>
        </div>
    );
}

function Card({ title, description, href }) {
    return (
        <Link href={href} className="transform hover:scale-105 transition-transform">
            <div className="p-6 bg-white shadow-lg rounded-lg border border-gray-200 hover:shadow-xl">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
                <p className="text-gray-600 mb-4">{description}</p>
                <span className="text-blue-500 font-semibold hover:underline">Go to {title}</span>
            </div>
        </Link>
    );
}
