import { toast } from "react-hot-toast";

/**
 * Handles chain change events from MetaMask.
 * Updates web3State with new chainId and optionally resets authentication.
 */
export const handleChainChange = (setWeb3State, chainIdHex) => {
    const chainId = parseInt(chainIdHex, 16);

    setWeb3State((prev) => ({
        ...prev,
        chainId,
        // Reset authentication because chain change may require re-signing
        isAuthenticated: false,
        // Optionally, reset other Particle/contract-related state if needed
        signer: prev.signer, // keep signer for gasless transactions
        contract: null,      // reset contract, will reinitialize on next action
    }));

    toast.success(`Switched to chain ${chainId}`);
};
