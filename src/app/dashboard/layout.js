import Navbar from "@/components/Nav";

export const metaData = {
    title: "SBTE Chatbot Admin",
    description: "Admin Panel for SBTE Chatbot",
};


const Layout = ({ children }) => {
    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            {children}
        </div>
    );
};

export default Layout;
