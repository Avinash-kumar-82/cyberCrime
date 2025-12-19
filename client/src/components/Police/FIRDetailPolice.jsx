import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getWeb3State } from "../../utils/getWeb3State";
import { toast } from "react-hot-toast";

const FIRDetailPolice = ({ firId, onClose }) => {
    const [firDetails, setFirDetails] = useState(null);
    const [remark, setRemark] = useState("");
    const [updating, setUpdating] = useState(false);

    const statusMap = {
        0: "FIR_SUBMITTED",
        1: "FIR_VERIFIED",
        2: "FIR_REJECTED",
        3: "CASE_UNDERPROCESS",
        4: "CASE_CLOSED",
    };

    useEffect(() => {
        const fetchDetails = async () => {
            const web3 = await getWeb3State();
            if (!web3) return;
            const contract = new ethers.Contract(web3.contractAddress, web3.contractInterface, web3.signer);

            try {
                const details = await contract.getFIRDetails(firId);
                setFirDetails(details);
            } catch (err) {
                console.error(err);
                toast.error("Failed to fetch FIR details");
            }
        };
        fetchDetails();
    }, [firId]);

    const updateStatus = async (newStatus) => {
        if (!remark) {
            toast.error("Enter a remark before updating");
            return;
        }
        setUpdating(true);
        try {
            const web3 = await getWeb3State();
            const contract = new ethers.Contract(web3.contractAddress, web3.contractInterface, web3.signer);

            const tx = await contract.updateCaseStatus(firId, newStatus, remark);
            await tx.wait();
            toast.success("FIR status updated ✅");
            onClose(); // refresh list
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    if (!firDetails) return <div>Loading...</div>;

    return (
        <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-700">
            <h3 className="font-semibold text-lg mb-2">FIR Details ID: {firDetails.id}</h3>
            <p><strong>Type:</strong> {statusMap[firDetails.firType]}</p>
            <p><strong>Status:</strong> {statusMap[firDetails.status]}</p>
            <p><strong>Accused:</strong> {firDetails.accusedData.join(", ")}</p>
            <p><strong>Description:</strong> {firDetails.description.join("; ")}</p>
            <p><strong>Evidence Hash:</strong> {firDetails.evidenceHash.join(", ")}</p>
            <p><strong>Assigned Police:</strong> {firDetails.assignedPolice}</p>

            <div className="mt-3">
                <textarea
                    placeholder="Add remark"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full p-2 mb-2 rounded bg-gray-700 text-gray-200"
                />

                <div className="flex gap-2">
                    {Object.entries(statusMap).map(([key, value]) => (
                        <button
                            key={key}
                            onClick={() => updateStatus(parseInt(key))}
                            disabled={updating}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                            {value}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FIRDetailPolice;
