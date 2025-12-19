import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getWeb3State } from "../../utils/getWeb3State";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const NavbarPolice = () => {
    const [account, setAccount] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            const web3 = await getWeb3State();
            if (!web3) return;

            setAccount(web3.selectedAccount);
            const contract = new ethers.Contract(
                web3.contractAddress,
                web3.contractInterface,
                web3.signer
            );

            try {
                const isPolice = await contract.policeWallets(web3.selectedAccount);
                if (!isPolice) {
                    toast.error("Not authorized as police");
                    navigate("/"); // redirect non-police
                }
            } catch (err) {
                console.error(err);
                navigate("/");
            }
        };
        init();
    }, []);

    return (
        <nav className="bg-gray-900 text-gray-200 p-4 flex justify-between items-center">
            <div className="font-bold text-xl">Police Dashboard</div>
            <div className="flex gap-4">
                <Link to="/police/dashboard" className="hover:text-blue-400">
                    Dashboard
                </Link>
                <Link to="/police/firlist" className="hover:text-blue-400">
                    FIR List
                </Link>
            </div>
            <div>{account ? account.slice(0, 6) + "..." + account.slice(-4) : ""}</div>
        </nav>
    );
};

export default NavbarPolice;
