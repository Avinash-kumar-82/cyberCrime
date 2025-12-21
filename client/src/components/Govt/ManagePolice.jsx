import { useEffect, useState } from "react";
import { useWeb3Context } from "../../context/userWeb3Context";
import { toast } from "react-hot-toast";

const ManagePolice = () => {
    const { web3State } = useWeb3Context();
    const { contract, role, selectedAccount } = web3State;

    const [policeList, setPoliceList] = useState([]);
    const [newPolice, setNewPolice] = useState("");

    // -------------------------------
    // Fetch police list from contract
    // -------------------------------
    const fetchPoliceList = async () => {
        if (!contract) return;

        try {
            const list = [];

            // You don’t have a direct function returning all police wallets,
            // so you might need to track via events or userFIRs. 
            // For simplicity, we check previously added addresses in your FIR system:
            // If your contract exposes a getter for police wallets, call it here.
            // Example (pseudo-code, replace with your actual contract method):
            // const count = await contract.getPoliceCount();
            // for (let i = 0; i < count; i++) {
            //   const wallet = await contract.policeWallets(i);
            //   list.push(wallet);
            // }

            setPoliceList(list);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch police list");
        }
    };

    // -------------------------------
    // Add a new police wallet
    // -------------------------------
    const addPolice = async () => {
        if (!contract) return;
        if (!newPolice) return toast.error("Enter wallet address");

        try {
            const tx = await contract.addPoliceWallet(newPolice);
            await tx.wait();

            toast.success("Police added successfully");
            setPoliceList((prev) => [...prev, newPolice]);
            setNewPolice("");
        } catch (err) {
            console.error(err);
            toast.error("Failed to add police");
        }
    };

    // -------------------------------
    // Remove police wallet
    // -------------------------------
    const removePolice = async (wallet) => {
        if (!contract) return;

        try {
            const tx = await contract.removePoliceWallet(wallet);
            await tx.wait();

            toast.success("Police removed successfully");
            setPoliceList((prev) => prev.filter((p) => p !== wallet));
        } catch (err) {
            console.error(err);
            toast.error("Failed to remove police");
        }
    };

    // -------------------------------
    // Fetch police list whenever contract is available
    // -------------------------------
    useEffect(() => {
        if (contract) fetchPoliceList();
    }, [contract]);

    if (!selectedAccount || role !== "owner") {
        return (
            <div className="p-6 text-red-400">
                Connect as government to manage police wallets.
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Manage Police Wallets</h1>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    className="p-2 bg-gray-800 text-gray-200 rounded border border-gray-700 w-64"
                    placeholder="New police wallet address"
                    value={newPolice}
                    onChange={(e) => setNewPolice(e.target.value)}
                />
                <button
                    className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                    onClick={addPolice}
                >
                    Add Police
                </button>
            </div>

            <div className="space-y-2">
                {policeList.length === 0 && (
                    <div className="text-gray-400">No police wallets found</div>
                )}
                {policeList.map((wallet) => (
                    <div
                        key={wallet}
                        className="flex justify-between items-center p-2 bg-gray-800 rounded border border-gray-700"
                    >
                        <span>{wallet}</span>
                        <button
                            className="bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                            onClick={() => removePolice(wallet)}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManagePolice;
