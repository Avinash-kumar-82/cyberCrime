import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useWeb3Context } from "../../context/userWeb3Context";

const TrackFIR = () => {
    const { web3State } = useWeb3Context();
    const { contract, isAuthenticated, selectedAccount } = web3State;

    const [trackingId, setTrackingId] = useState("");
    const [trackingResult, setTrackingResult] = useState(null);
    const [userFIRs, setUserFIRs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedFIRs, setExpandedFIRs] = useState({}); // For expand/collapse

    const statusMap = {
        0: "FIR_SUBMITTED",
        1: "FIR_VERIFIED",
        2: "FIR_REJECTED",
        3: "CASE_UNDERPROCESS",
        4: "CASE_CLOSED",
    };

    /* ---------------- Fetch user's FIRs ---------------- */
    const fetchUserFIRs = useCallback(async () => {
        if (!contract || !selectedAccount) return;

        try {
            const allFIRs = await contract.userFIRs(selectedAccount);
            // Map results to readable format
            const formattedFIRs = allFIRs.reverse().map((f) => ({
                firId: f.firId.toNumber(),
                firType: f.firType,
                status: f.status,
                policeRemarks: f.policeRemarks,
                accused: f.accused,       // Assuming smart contract returns array
                evidence: f.evidence,     // Array of IPFS hashes
                description: f.description, // Array of strings
                crimeTimestamp: f.crimeTimestamp.toNumber(),
            }));
            setUserFIRs(formattedFIRs);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch your FIRs");
        }
    }, [contract, selectedAccount]);

    useEffect(() => {
        if (isAuthenticated) fetchUserFIRs();
    }, [isAuthenticated, fetchUserFIRs]);

    /* ---------------- Track by ID ---------------- */
    const trackCaseById = async () => {
        if (!trackingId) {
            return toast.error("Enter a valid tracking ID");
        }

        if (!contract) return toast.error("Contract not ready");

        setLoading(true);

        try {
            const result = await contract.trackCase(trackingId);
            setTrackingResult({
                firId: result[0].toNumber(),
                firType: result[1],
                status: result[2],
                policeRemarks: result[3],
                accused: result[4],
                evidence: result[5],
                description: result[6],
                crimeTimestamp: result[7].toNumber(),
            });
            toast.success("Tracking info fetched ✅");
        } catch (err) {
            console.error(err);
            toast.error("Invalid tracking ID or access denied");
            setTrackingResult(null);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (firId) => {
        setExpandedFIRs((prev) => ({ ...prev, [firId]: !prev[firId] }));
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-900 text-gray-200 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Track FIR 🔍</h2>

            {/* Track by ID */}
            <div className="mb-6 p-4 border border-gray-700 rounded bg-gray-800">
                <h3 className="font-semibold mb-2">Track Case by ID</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 p-2 rounded bg-gray-700 border border-gray-600"
                        placeholder="Enter Tracking ID"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                    />
                    <button
                        onClick={trackCaseById}
                        disabled={loading || !isAuthenticated}
                        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "Fetching..." : "Track"}
                    </button>
                </div>

                {trackingResult && (
                    <div className="mt-4 p-3 bg-gray-700 rounded">
                        <p><b>FIR ID:</b> {trackingResult.firId}</p>
                        <p><b>Type:</b> {trackingResult.firType}</p>
                        <p><b>Status:</b> {statusMap[trackingResult.status]}</p>
                        <p><b>Remarks:</b> {trackingResult.policeRemarks.join("; ")}</p>
                    </div>
                )}
            </div>

            {/* List of User's FIRs */}
            <div className="p-4 border border-gray-700 rounded bg-gray-800">
                <h3 className="font-semibold mb-2">Your FIRs</h3>
                {userFIRs.length === 0 ? (
                    <p className="text-gray-400 text-sm">No FIRs submitted yet.</p>
                ) : (
                    <div className="space-y-2">
                        {userFIRs.map((f) => (
                            <div
                                key={f.firId}
                                className="p-3 border border-gray-700 rounded bg-gray-900 cursor-pointer hover:bg-gray-700"
                            >
                                <div className="flex justify-between items-center" onClick={() => toggleExpand(f.firId)}>
                                    <div>
                                        <p><b>ID:</b> {f.firId}</p>
                                        <p><b>Type:</b> {f.firType}</p>
                                        <p><b>Status:</b> {statusMap[f.status]}</p>
                                    </div>
                                    <div>{expandedFIRs[f.firId] ? "▲" : "▼"}</div>
                                </div>

                                {expandedFIRs[f.firId] && (
                                    <div className="mt-2 text-sm bg-gray-800 p-2 rounded">
                                        <p><b>Crime Date:</b> {new Date(f.crimeTimestamp * 1000).toLocaleDateString()}</p>
                                        <p><b>Accused:</b> {f.accused.join(" | ")}</p>
                                        <p><b>Description:</b> {f.description.join("; ")}</p>
                                        <p><b>Evidence:</b> {f.evidence.join(", ")}</p>
                                        <p><b>Police Remarks:</b> {f.policeRemarks.join("; ")}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackFIR;
