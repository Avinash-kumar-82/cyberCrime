import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getWeb3State } from "../../utils/getWeb3State";
import { toast } from "react-hot-toast";
import FIRDetailPolice from "./FIRDetailPolice";

const FIRListPolice = () => {
    const [firList, setFirList] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [selectedFIR, setSelectedFIR] = useState(null);

    const statusMap = {
        0: "FIR_SUBMITTED",
        1: "FIR_VERIFIED",
        2: "FIR_REJECTED",
        3: "CASE_UNDERPROCESS",
        4: "CASE_CLOSED",
    };

    useEffect(() => {
        const fetchFIRs = async () => {
            const web3 = await getWeb3State();
            if (!web3) return;

            const contract = new ethers.Contract(
                web3.contractAddress,
                web3.contractInterface,
                web3.signer
            );

            try {
                const allFIRs = await contract.getAllFIRsForPolice();
                setFirList(allFIRs.reverse());
            } catch (err) {
                console.error(err);
                toast.error("Failed to fetch FIRs");
            }
        };
        fetchFIRs();
    }, []);

    const filteredFIRs =
        filter === "ALL"
            ? firList
            : firList.filter((f) => statusMap[f.status] === filter);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">FIR List</h1>

            <div className="flex gap-4 mb-4">
                {["ALL", "FIR_SUBMITTED", "FIR_VERIFIED", "FIR_REJECTED", "CASE_CLOSED"].map((f) => (
                    <button
                        key={f}
                        className={`px-3 py-1 rounded ${filter === f ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"
                            }`}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                {filteredFIRs.map((fir) => (
                    <div
                        key={fir.firId}
                        className="p-3 border border-gray-700 rounded bg-gray-800 flex justify-between cursor-pointer hover:bg-gray-700"
                        onClick={() => setSelectedFIR(fir.firId)}
                    >
                        <div>
                            <p><strong>ID:</strong> {fir.firId}</p>
                            <p><strong>Type:</strong> {fir.firType}</p>
                            <p><strong>Status:</strong> {statusMap[fir.status]}</p>
                        </div>
                    </div>
                ))}
            </div>

            {selectedFIR && (
                <FIRDetailPolice firId={selectedFIR} onClose={() => setSelectedFIR(null)} />
            )}
        </div>
    );
};

export default FIRListPolice;
