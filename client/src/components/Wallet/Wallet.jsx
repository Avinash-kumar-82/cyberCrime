import { useEffect, useRef } from "react";
import { Wallet as WalletIcon, CheckCircle } from "lucide-react";
import { useWeb3Context } from "../../context/userWeb3Context";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Wallet = ({ compact = false }) => {
    const { web3State, handleWallet } = useWeb3Context();
    const { selectedAccount, role } = web3State;

    const navigate = useNavigate();
    const redirectedRef = useRef(false);

    // ---------------------------- Connect wallet ----------------------------
    const connectWallet = async () => {
        try {
            const state = await handleWallet();
            if (!state) return;

            toast.success("Wallet connected successfully!");
            // After this, Particle is ready for gasless transactions
        } catch (err) {
            console.error(err);
            toast.error("Wallet connection failed");
        }
    };

    // ---------------------------- Redirect based on role ----------------------------
    useEffect(() => {
        if (!selectedAccount || !role) return;
        if (redirectedRef.current) return;

        if (role === "owner") navigate("/govt/manage-police", { replace: true });
        else if (role === "police") navigate("/police/dashboard", { replace: true });
        else navigate("/", { replace: true });

        redirectedRef.current = true;
    }, [selectedAccount, role, navigate]);

    // ---------------------------- Connected state UI ----------------------------
    if (selectedAccount) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-600/20 cursor-default">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-mono text-emerald-300">
                    {selectedAccount.slice(0, 6)}...{selectedAccount.slice(-4)}
                </span>
            </div>
        );
    }

    // ---------------------------- Connect button ----------------------------
    return (
        <div
            onClick={connectWallet}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-400/30 bg-gray-700/20 cursor-pointer ${compact ? "text-sm" : "text-base"
                } hover:bg-gray-700/40 transition`}
        >
            <WalletIcon className="w-4 h-4" />
            <span>Connect Wallet</span>
        </div>
    );
};

export default Wallet;
