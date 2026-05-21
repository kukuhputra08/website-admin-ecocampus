import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function AdminLayout(){
    return(
        <div className="min-h-screen bg-slate-50">
            <div className="flex">
                <Sidebar />
                <div className="flex min-h-screen flex-1 flex-col">
                    <Navbar />
                    <div className="flex-1 p-6">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}
export default AdminLayout;