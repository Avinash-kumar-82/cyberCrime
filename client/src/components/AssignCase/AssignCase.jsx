import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useWeb3Context } from "../../context/userWeb3Context";

/* -----------------------------------------
   Status mapping (same as contract enum)
------------------------------------------ */
const STATUS_MAP = {
    0: "FIR_SUBMITTED",
    1: "FIR_VERIFIED",
    2: "FIR_REJECTED",
    3: "CASE_UNDERPROCESS",
    4: "CASE_CLOSED",
};

const AssignCase = () => {
    const { web3State } = useWeb3Context();
    const {
        contract,
        isAuthenticated,
        role,          // "government" | "police" | "user"
    } = web3State;

    const [firList, setFirList] = useState([]);
    const [policeList, setPoliceList] = useState([]);
    const [selectedFIR, setSelectedFIR] = useState("");
    const [selectedPolice, setSelectedPolice] = useState("");
    const [loading, setLoading] = useState(false);

    /* ---------------- Fetch FIRs + Police ---------------- */

    const fetchData = useCallback(async () => {
        if (!contract) return;

        try {
            // All FIR summaries
            const allFIRs = await contract.getAllFIRsForPolice();

            // Only assignable FIRs
            const assignable = allFIRs.filter(
                (f) =>
                    f.status !== 4 && // not CASE_CLOSED
                    f.assignedPolice === "0x0000000000000000000000000000000000000000"
            );

            setFirList(assignable.reverse());

            // Police wallets (getter must exist in contract)
            const police = await contract.getAllPolice();
            setPoliceList(police);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load FIRs or Police list");
        }
    }, [contract]);

    /* ---------------- Initial Load ---------------- */

    useEffect(() => {
        if (isAuthenticated && role === "government") {
            fetchData();
        }
    }, [fetchData, isAuthenticated, role]);

    /* ---------------- Event-Based Auto Refresh ---------------- */

    useEffect(() => {
        if (!contract) return;

        const refresh = () => fetchData();

        contract.on("FIRRegistered", refresh);
        contract.on("FIRAssigned", refresh);
        contract.on("PoliceWalletAdded", refresh);
        contract.on("PoliceWalletRemoved", refresh);

        return () => {
            contract.off("FIRRegistered", refresh);
            contract.off("FIRAssigned", refresh);
            contract.off("PoliceWalletAdded", refresh);
            contract.off("PoliceWalletRemoved", refresh);
        };
    }, [contract, fetchData]);

    /* ---------------- Assign FIR ---------------- */

    const assignCase = async () => {
        if (!selectedFIR || !selectedPolice) {
            toast.error("Select FIR and Police wallet");
            return;
        }

        try {
            setLoading(true);

            const tx = await contract.assignFIRToPolice(
                selectedFIR,
                selectedPolice
            );
            await tx.wait();

            toast.success("FIR assigned successfully ✅");

            setSelectedFIR("");
            setSelectedPolice("");
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(err?.reason || err?.message || "Assignment failed");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- Guards ---------------- */

    if (!isAuthenticated) {
        return (
            <div className="p-6 text-gray-400">
                Connect wallet to assign FIRs.
            </div>
        );
    }

    if (role !== "government") {
        return (
            <div className="p-6 text-red-400">
                Access denied. Only government can assign cases.
            </div>
        );
    }

    /* ---------------- UI ---------------- */

    return (
        <div className="p-6 max-w-xl">
            <h2 className="text-2xl font-bold mb-6">
                Assign FIR to Police
            </h2>

            {/* FIR SELECT */}
            <div className="mb-4">
                <label className="block mb-1 text-sm">FIR</label>
                <select
                    value={selectedFIR}
                    onChange={(e) => setSelectedFIR(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                >
                    <option value="">Select FIR</option>
                    {firList.map((f) => (
                        <option
                            key={f.firId.toString()}
                            value={f.firId.toString()}
                        >
                            #{f.firId.toString()} — {STATUS_MAP[f.status]}
                        </option>
                    ))}
                </select>
            </div>

            {/* POLICE SELECT */}
            <div className="mb-6">
                <label className="block mb-1 text-sm">
                    Police Wallet
                </label>
                <select
                    value={selectedPolice}
                    onChange={(e) => setSelectedPolice(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                >
                    <option value="">Select Police</option>
                    {policeList.map((p) => (
                        <option key={p} value={p}>
                            {p.slice(0, 6)}...{p.slice(-4)}
                        </option>
                    ))}
                </select>
            </div>

            <button
                disabled={loading}
                onClick={assignCase}
                className={`px-4 py-2 rounded text-white transition ${loading
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
            >
                {loading ? "Assigning..." : "Assign Case"}
            </button>
        </div>
    );
};

export default AssignCase;
