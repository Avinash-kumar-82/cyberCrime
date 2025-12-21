import { toast } from "react-hot-toast";

/**
 * Handles account change events from MetaMask.
 * Updates web3State and resets authentication if account changes.
 */
export const handleAccountChange = (setWeb3State, accounts) => {
    const selectedAccount = accounts?.[0] || null;

    if (!selectedAccount) {
        toast.warning("No account selected");
        setWeb3State((prev) => ({
            ...prev,
            selectedAccount: null,
            signer: null,
            contractInterface: null,
            contractAddress: null,
            contract: null,
            role: null,
            token: null,
            isAuthenticated: false,
            particle: null, // reset Particle signer
            provider: null,
            chainId: null,
        }));
        return;
    }

    // Preserve isAuthenticated if same account, otherwise reset
    setWeb3State((prev) => ({
        ...prev,
        selectedAccount,
        isAuthenticated: prev.selectedAccount === selectedAccount ? prev.isAuthenticated : false,
    }));
};
