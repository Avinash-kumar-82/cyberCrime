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

const FILTERS = [
    "ALL",
    "FIR_SUBMITTED",
    "FIR_VERIFIED",
    "FIR_REJECTED",
    "CASE_UNDERPROCESS",
    "CASE_CLOSED",
];

const DashboardPolice = () => {
    const { web3State } = useWeb3Context();
    const { contract, selectedAccount, isAuthenticated } = web3State;

    const [firList, setFirList] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [selectedFIR, setSelectedFIR] = useState(null);

    /* ---------------- Fetch FIRs ---------------- */

    const fetchFIRs = useCallback(async () => {
        try {
            if (!contract || !selectedAccount) return;

            const allFIRs = await contract.getAllFIRsForPolice();

            const myFIRs = allFIRs.filter(
                (f) =>
                    f.assignedPolice &&
                    f.assignedPolice.toLowerCase() === selectedAccount.toLowerCase()
            );

            setFirList(myFIRs.reverse());
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch FIRs");
        }
    }, [contract, selectedAccount]);

    /* ---------------- Initial Fetch ---------------- */

    useEffect(() => {
        if (isAuthenticated) {
            fetchFIRs();
        }
    }, [fetchFIRs, isAuthenticated]);

    /* ---------------- Event-based Auto Refresh ---------------- */

    useEffect(() => {
        if (!contract) return;

        const onFIRAssigned = () => {
            fetchFIRs();
        };

        contract.on("FIRAssigned", onFIRAssigned);

        return () => {
            contract.off("FIRAssigned", onFIRAssigned);
        };
    }, [contract, fetchFIRs]);

    /* ---------------- Filter ---------------- */

    const filteredFIRs =
        filter === "ALL"
            ? firList
            : firList.filter((f) => STATUS_MAP[f.status] === filter);

    /* ---------------- UI ---------------- */

    if (!isAuthenticated) {
        return (
            <div className="p-6 text-gray-400">
                Connect wallet to view assigned FIRs.
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Assigned FIRs</h1>

            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        className={`px-3 py-1 rounded text-sm transition ${filter === f
                                ? "bg-blue-600 text-white"
                                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                            }`}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* FIR List */}
            <div className="space-y-3">
                {filteredFIRs.length === 0 && (
                    <p className="text-gray-400 text-sm">No FIRs found</p>
                )}

                {filteredFIRs.map((fir) => (
                    <div
                        key={fir.firId.toString()}
                        className="p-4 border border-gray-700 rounded bg-gray-800 hover:bg-gray-700 cursor-pointer"
                        onClick={() => setSelectedFIR(fir.firId)}
                    >
                        <p>
                            <strong>ID:</strong> {fir.firId.toString()}
                        </p>
                        <p>
                            <strong>Type:</strong> {fir.firType}
                        </p>
                        <p>
                            <strong>Status:</strong> {STATUS_MAP[fir.status]}
                        </p>
                        <p>
                            <strong>Assigned Police:</strong>{" "}
                            {fir.assignedPolice.slice(0, 6)}...
                            {fir.assignedPolice.slice(-4)}
                        </p>
                    </div>
                ))}
            </div>

            {/* FIR Detail Modal */}
            {selectedFIR && (
                <FIRDetailPolice
                    firId={selectedFIR}
                    onClose={() => {
                        setSelectedFIR(null);
                        fetchFIRs(); // refresh after update
                    }}
                />
            )}
        </div>
    );
};

export default DashboardPolice;
