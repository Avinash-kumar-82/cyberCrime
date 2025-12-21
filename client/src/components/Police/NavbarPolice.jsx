import { useEffect } from "react";
import { useWeb3Context } from "../../context/userWeb3Context";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const NavbarPolice = () => {
    const { web3State } = useWeb3Context();
    const { selectedAccount, role } = web3State;
    const navigate = useNavigate();

    // ✅ Allow only police & owner
    useEffect(() => {
        if (!selectedAccount || !role) return;

        if (role !== "police" && role !== "owner") {
            toast.error("Not authorized");
            navigate("/");
        }
    }, [selectedAccount, role, navigate]);

    return (
        <nav className="bg-gray-900 text-gray-200 p-4 flex justify-between items-center">
            {/* Title */}
            <div className="font-bold text-xl">
                {role === "owner" ? "Government Dashboard" : "Police Dashboard"}
            </div>

            {/* Links */}
            <div className="flex gap-6">
                <Link to="/police/dashboard" className="hover:text-blue-400">
                    Dashboard
                </Link>

                <Link to="/police/firlist" className="hover:text-blue-400">
                    FIR List
                </Link>

                {/* 🔐 ONLY GOVT CAN SEE */}
                {role === "owner" && (
                    <Link
                        to="/govt/manage-police"
                        className="hover:text-red-400 font-semibold"
                    >
                        Manage Police
                    </Link>
                )}
            </div>

            {/* Wallet */}
            <div className="text-sm">
                {selectedAccount
                    ? selectedAccount.slice(0, 6) +
                    "..." +
                    selectedAccount.slice(-4)
                    : ""}
            </div>
        </nav>
    );
};

export default NavbarPolice;
