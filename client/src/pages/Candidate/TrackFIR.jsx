import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { getWeb3State } from "../../utils/getWeb3State";

const TrackFIR = () => {
    const [trackingId, setTrackingId] = useState("");
    const [trackingResult, setTrackingResult] = useState(null);
    const [userFIRs, setUserFIRs] = useState([]);
    const [loading, setLoading] = useState(false);

    const statusMap = {
        0: "FIR_SUBMITTED",
        1: "FIR_VERIFIED",
        2: "FIR_REJECTED",
        3: "CASE_UNDERPROCESS",
        4: "CASE_CLOSED",
    };

    useEffect(() => {
        const fetchUserFIRs = async () => {
            const web3 = await getWeb3State();
            if (!web3) return;

            const contract = new ethers.Contract(
                web3.contractAddress,
                web3.contractInterface,
                web3.signer
            );

            try {
                const firs = await contract.getMyFIRs();
                // Add expanded property for UI
                setUserFIRs(firs.map((f) => ({ ...f, expanded: false })));
            } catch (err) {
                console.error(err);
                toast.error("Failed to fetch your FIRs");
            }
        };

        fetchUserFIRs();
    }, []);

    const trackCaseById = async () => {
        if (!trackingId) return toast.error("Enter a valid tracking ID");

        setLoading(true);
        const web3 = await getWeb3State();
        if (!web3) {
            setLoading(false);
            return;
        }

        const contract = new ethers.Contract(
            web3.contractAddress,
            web3.contractInterface,
            web3.signer
        );

        try {
            const result = await contract.trackCase(trackingId);
            setTrackingResult({
                firId: result[0].toNumber(),
                firType: result[1],
                status: result[2],
                policeRemarks: result[3],
            });
            toast.success("Tracking info fetched ✅");
        } catch (err) {
            console.error(err);
            toast.error("Invalid tracking ID");
            setTrackingResult(null);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (firId) => {
        setUserFIRs((prev) =>
            prev.map((f) => (f.firId === firId ? { ...f, expanded: !f.expanded } : f))
        );
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-900 text-gray-200 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Track Your FIRs 🔍</h2>

            {/* Track by ID */}
            <div className="mb-6 p-4 border border-gray-700 rounded bg-gray-800">
                <h3 className="font-semibold mb-2">Track Case by ID:</h3>
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
                        className={`px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        disabled={loading}
                    >
                        {loading ? "Fetching..." : "Track"}
                    </button>
                </div>

                {trackingResult && (
                    <div className="mt-4 p-3 bg-gray-700 rounded">
                        <p><strong>FIR ID:</strong> {trackingResult.firId}</p>
                        <p><strong>Type:</strong> {trackingResult.firType}</p>
                        <p><strong>Status:</strong> {statusMap[trackingResult.status]}</p>
                        <p><strong>Police Remarks:</strong> {trackingResult.policeRemarks.join("; ")}</p>
                    </div>
                )}
            </div>

            {/* User FIR List */}
            <h3 className="text-xl font-semibold mb-4">Your FIR List:</h3>
            <div className="space-y-2">
                {userFIRs.map((fir) => (
                    <div key={fir.firId} className="border border-gray-700 rounded bg-gray-800">
                        <div
                            className="p-3 cursor-pointer flex justify-between items-center hover:bg-gray-700"
                            onClick={() => toggleExpand(fir.firId)}
                        >
                            <div>
                                <p><strong>ID:</strong> {fir.firId}</p>
                                <p><strong>Type:</strong> {fir.firType}</p>
                                <p><strong>Status:</strong> {statusMap[fir.status]}</p>
                                <p><strong>Assigned Police:</strong> {fir.assignedPolice && fir.assignedPolice !== ethers.constants.AddressZero ? fir.assignedPolice : "Not assigned"}</p>
                            </div>
                            <div>{fir.expanded ? "▲" : "▼"}</div>
                        </div>

                        {fir.expanded && (
                            <div className="p-3 border-t border-gray-700 bg-gray-900">
                                <p><strong>Accused:</strong> {fir.accusedData.join(", ")}</p>
                                <p><strong>Description:</strong> {fir.description.join("; ")}</p>
                                <p><strong>Evidence:</strong> {fir.evidenceHash.join(", ")}</p>
                                <p><strong>Crime Date:</strong> {new Date(fir.crimeDate * 1000).toLocaleDateString()}</p>
                                <p><strong>FIR Date:</strong> {new Date(fir.firDate * 1000).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrackFIR;
