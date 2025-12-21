import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useWeb3Context } from "../../context/userWeb3Context";
import FIRDetailPolice from "./FIRDetailPolice";

const STATUS_MAP = {
    0: "FIR_SUBMITTED",
    1: "FIR_VERIFIED",
    2: "FIR_REJECTED",
    3: "CASE_UNDERPROCESS",
    4: "CASE_CLOSED",
};

const FILTERS = ["ALL", "FIR_SUBMITTED", "FIR_VERIFIED", "FIR_REJECTED", "CASE_CLOSED"];

const FIRListPolice = () => {
    const { web3State } = useWeb3Context();
    const { contract, isAuthenticated } = web3State;

    const [firList, setFirList] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [selectedFIR, setSelectedFIR] = useState(null);

    /* ---------------- Fetch FIRs ---------------- */
    const fetchFIRs = useCallback(async () => {
        if (!contract) return;
        try {
            const allFIRs = await contract.getAllFIRsForPolice();
            setFirList(allFIRs.reverse());
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch FIRs");
        }
    }, [contract]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchFIRs();
        }
    }, [fetchFIRs, isAuthenticated]);

    /* ---------------- Listen to FIR Updates ---------------- */
    useEffect(() => {
        if (!contract) return;

        const onStatusUpdated = (firId) => {
            // Refresh list when a FIR status is updated
            fetchFIRs();
        };

        contract.on("CaseStatusUpdated", onStatusUpdated);

        return () => {
            contract.off("CaseStatusUpdated", onStatusUpdated);
        };
    }, [contract, fetchFIRs]);

    /* ---------------- Filtered FIRs ---------------- */
    const filteredFIRs =
        filter === "ALL"
            ? firList
            : firList.filter((f) => STATUS_MAP[f.status] === filter);

    /* ---------------- UI ---------------- */
    if (!isAuthenticated) {
        return (
            <div className="p-6 text-gray-400">
                Connect wallet to view FIRs.
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">FIR List</h1>

            {/* Filters */}
            <div className="flex gap-4 mb-4">
                {FILTERS.map((f) => (
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

            {/* FIR List */}
            <div className="space-y-2">
                {filteredFIRs.length === 0 && (
                    <p className="text-gray-400 text-sm">No FIRs found</p>
                )}

                {filteredFIRs.map((fir) => (
                    <div
                        key={fir.firId}
                        className="p-3 border border-gray-700 rounded bg-gray-800 flex justify-between cursor-pointer hover:bg-gray-700"
                        onClick={() => setSelectedFIR(fir.firId)}
                    >
                        <div>
                            <p><strong>ID:</strong> {fir.firId}</p>
                            <p><strong>Type:</strong> {fir.firType}</p>
                            <p><strong>Status:</strong> {STATUS_MAP[fir.status]}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* FIR Detail Modal */}
            {selectedFIR && (
                <FIRDetailPolice firId={selectedFIR} onClose={() => setSelectedFIR(null)} />
            )}
        </div>
    );
};

export default FIRListPolice;
