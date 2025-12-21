import { useEffect, useState } from "react";
import { useWeb3Context } from "../../context/userWeb3Context";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const NavbarGovt = () => {
    const { web3State } = useWeb3Context();
    const { selectedAccount, role } = web3State;
    const navigate = useNavigate();

    // ✅ Redirect if user is not owner/government
    useEffect(() => {
        if (!selectedAccount || !role) return;

        if (role !== "owner") {
            toast.error("Not authorized as government");
            navigate("/"); // redirect non-owner
        }
    }, [selectedAccount, role]);

    return (
        <nav className="bg-gray-900 text-gray-200 p-4 flex justify-between items-center">
            <div className="font-bold text-xl">Government Dashboard</div>
            <div className="flex gap-4">
                <Link to="/govt/manage-police" className="hover:text-blue-400">
                    Manage Police
                </Link>
            </div>
            <div>
                {selectedAccount ? selectedAccount.slice(0, 6) + "..." + selectedAccount.slice(-4) : ""}
            </div>
        </nav>
    );
};

export default NavbarGovt;