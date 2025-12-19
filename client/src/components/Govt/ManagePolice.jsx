import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getWeb3State } from "../../utils/getWeb3State";
import { toast } from "react-hot-toast";

const ManagePolice = () => {
    const [policeList, setPoliceList] = useState([]);
    const [newPolice, setNewPolice] = useState("");

    useEffect(() => {
        const fetchPolice = async () => {
            const web3 = await getWeb3State();
            if (!web3) return;

            const contract = new ethers.Contract(
                web3.contractAddress,
                web3.contractInterface,
                web3.signer
            );

            try {
                const list = await contract.getPoliceWallets();
                setPoliceList(list);
            } catch (err) {
                console.error(err);
                toast.error("Failed to fetch police list");
            }
        };
        fetchPolice();
    }, []);

    const addPolice = async () => {
        const web3 = await getWeb3State();
        if (!web3) return;

        const contract = new ethers.Contract(
            web3.contractAddress,
            web3.contractInterface,
            web3.signer
        );

        try {
            await contract.addPoliceWallet(newPolice);
            toast.success("Police added successfully");
            setPoliceList([...policeList, newPolice]);
            setNewPolice("");
        } catch (err) {
            console.error(err);
            toast.error("Failed to add police");
        }
    };

    const removePolice = async (wallet) => {
        const web3 = await getWeb3State();
        if (!web3) return;

        const contract = new ethers.Contract(
            web3.contractAddress,
            web3.contractInterface,
            web3.signer
        );

        try {
            await contract.removePoliceWallet(wallet);
            toast.success("Police removed successfully");
            setPoliceList(policeList.filter((p) => p !== wallet));
        } catch (err) {
            console.error(err);
            toast.error("Failed to remove police");
        }
    };

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
                {policeList.map((wallet) => (
                    <div key={wallet} className="flex justify-between items-center p-2 bg-gray-800 rounded border border-gray-700">
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
