import { Wallet as WalletIcon, CheckCircle } from "lucide-react";
import { useWeb3Context } from "../../context/userWeb3Context";
import { toast } from "react-hot-toast";

const Wallet = ({ compact = false }) => {
    const { web3State, handleWallet } = useWeb3Context();
    const { selectedAccount } = web3State;

    const connectWallet = async () => {
        try {
            await handleWallet();
        } catch (err) {
            console.error(err);
            toast.error("Wallet connection failed");
        }
    };

    // ✅ If wallet connected
    if (selectedAccount) {
        return (
            <div
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-600/20 cursor-default"
            >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-mono text-emerald-300">
                    {selectedAccount.slice(0, 6)}...{selectedAccount.slice(-4)}
                </span>
            </div>
        );
    }

    // ❌ If wallet not connected
    return (
        <div
            onClick={connectWallet}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-400/30 bg-gray-700/20 cursor-pointer ${compact ? "text-sm" : "text-base"
                } hover:bg-gray-700/40 transition`}
        >
            <WalletIcon className="w-4 h-4" />
            <button>Connect Wallet</button>
        </div>
    );
};

export default Wallet;
