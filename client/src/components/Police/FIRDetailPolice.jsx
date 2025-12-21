import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useWeb3Context } from "../../context/userWeb3Context";

const STATUS_MAP = {
    0: "FIR_SUBMITTED",
    1: "FIR_VERIFIED",
    2: "FIR_REJECTED",
    3: "CASE_UNDERPROCESS",
    4: "CASE_CLOSED",
};

const FIRDetailPolice = ({ firId, onClose }) => {
    const { web3State } = useWeb3Context();
    const { contract, isAuthenticated } = web3State;

    const [firDetails, setFirDetails] = useState(null);
    const [remark, setRemark] = useState("");
    const [updating, setUpdating] = useState(false);

    /* ---------------- Fetch FIR Details ---------------- */

    const fetchDetails = useCallback(async () => {
        if (!contract || firId === null) return;

        try {
            const details = await contract.getFIRDetails(firId);
            setFirDetails(details);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch FIR details");
        }
    }, [contract, firId]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchDetails();
        }
    }, [fetchDetails, isAuthenticated]);

    /* ---------------- Event-based auto refresh ---------------- */

    useEffect(() => {
        if (!contract) return;

        const onStatusUpdated = (updatedFirId) => {
            if (Number(updatedFirId) === Number(firId)) {
                fetchDetails();
            }
        };

        contract.on("CaseStatusUpdated", onStatusUpdated);

        return () => {
            contract.off("CaseStatusUpdated", onStatusUpdated);
        };
    }, [contract, firId, fetchDetails]);

    /* ---------------- Update Status ---------------- */

    const updateStatus = async (newStatus) => {
        if (!remark.trim()) {
            toast.error("Enter a remark before updating");
            return;
        }

        if (!contract) return;

        setUpdating(true);
        try {
            const tx = await contract.updateCaseStatus(
                firId,
                newStatus,
                remark
            );
            await tx.wait();

            toast.success("FIR status updated ✅");
            setRemark("");
            fetchDetails();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err?.message || "Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    /* ---------------- UI ---------------- */

    if (!isAuthenticated) {
        return (
            <div className="p-4 bg-gray-800 rounded border border-gray-700 text-gray-400">
                Connect wallet to view FIR details.
            </div>
        );
    }

    if (!firDetails) {
        return (
            <div className="p-4 bg-gray-800 rounded border border-gray-700 text-gray-400">
                Loading FIR details...
            </div>
        );
    }

    return (
        <div className="mt-6 p-6 bg-gray-800 rounded-xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                    FIR Details — ID #{firDetails.id.toString()}
                </h3>
                <button
                    onClick={onClose}
                    className="text-sm text-red-400 hover:underline"
                >
                    Close
                </button>
            </div>

            <div className="space-y-2 text-sm">
                <p>
                    <strong>Status:</strong> {STATUS_MAP[firDetails.status]}
                </p>

                <p>
                    <strong>Assigned Police:</strong> {firDetails.assignedPolice}
                </p>

                <p>
                    <strong>Accused:</strong> {firDetails.accusedData.join(" | ")}
                </p>

                <p>
                    <strong>Description:</strong> {firDetails.description.join(" | ")}
                </p>

                <p>
                    <strong>Evidence Hash:</strong> {firDetails.evidenceHash.join(", ")}
                </p>
            </div>

            {/* Update Section */}
            <div className="mt-4">
                <textarea
                    placeholder="Add remark"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full p-2 mb-3 rounded bg-gray-700 text-gray-200 resize-none"
                />

                <div className="flex gap-2 flex-wrap">
                    {Object.entries(STATUS_MAP).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => updateStatus(Number(key))}
                            disabled={updating}
                            className="px-3 py-1 rounded text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FIRDetailPolice;
