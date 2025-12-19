import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getWeb3State } from "../../utils/getWeb3State";
import { toast } from "react-hot-toast";

const AssignCase = () => {
    const [firList, setFirList] = useState([]);
    const [policeList, setPoliceList] = useState([]);
    const [selectedFIR, setSelectedFIR] = useState(null);
    const [selectedPolice, setSelectedPolice] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const web3 = await getWeb3State();
            if (!web3) return;
            const contract = new ethers.Contract(web3.contractAddress, web3.contractInterface, web3.signer);

            // Fetch all FIRs
            const allFIRs = await contract.getAllFIRsForPolice();
            setFirList(allFIRs.reverse());

            // Fetch all police wallets (frontend can have another function)
            const policeWallets = Object.keys(await contract.policeWallets); // or implement getPoliceWallets
            setPoliceList(policeWallets);
        };
        fetchData();
    }, []);

    const assignCase = async () => {
        if (!selectedFIR || !selectedPolice) {
            toast.error("Select FIR and Police wallet");
            return;
        }
        try {
            const web3 = await getWeb3State();
            const contract = new ethers.Contract(web3.contractAddress, web3.contractInterface, web3.signer);

            const tx = await contract.assignFIRToPolice(selectedFIR, selectedPolice);
            await tx.wait();
            toast.success("FIR assigned to police successfully ✅");
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to assign FIR");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Assign FIR to Police</h2>

            <div className="mb-4">
                <label>FIR</label>
                <select onChange={(e) => setSelectedFIR(e.target.value)} className="w-full p-2">
                    <option value="">Select FIR</option>
                    {firList.map((f) => (
                        <option key={f.firId} value={f.firId}>
                            {f.firId} - {f.firType} - {f.status}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label>Police</label>
                <select onChange={(e) => setSelectedPolice(e.target.value)} className="w-full p-2">
                    <option value="">Select Police</option>
                    {policeList.map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>

            <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={assignCase}
            >
                Assign Case
            </button>
        </div>
    );
};

export default AssignCase;
