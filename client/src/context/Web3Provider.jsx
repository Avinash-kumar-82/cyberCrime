import { useEffect, useState, useCallback } from "react";
import { Web3Context } from "./web3Context";
import { getWeb3State } from "../utils/getWeb3State";
import { toast } from "react-hot-toast";
import { handleAccountChange } from "../utils/handleAccountChange";
import { handleChainChange } from "../utils/handleChainChange";

const INITIAL_STATE = {
    selectedAccount: null,
    chainId: null,

    provider: null,
    signer: null,

    // READ-ONLY contract (for reads only)
    readContract: null,
    contractAddress: null,

    role: null,
    token: null,
    isAuthenticated: false,

    // Gelato
    relay: null,
};

const Web3Provider = ({ children }) => {
    const [web3State, setWeb3State] = useState(INITIAL_STATE);

    // ------------------ Connect wallet ------------------
    const handleWallet = useCallback(async () => {
        try {
            if (!window.ethereum) {
                toast.error("MetaMask not installed");
                return null;
            }

            const state = await getWeb3State();
            if (!state) return null;

            setWeb3State((prev) => ({
                ...prev,
                ...state,

                // preserve auth if same wallet
                isAuthenticated:
                    prev.selectedAccount === state.selectedAccount && state.token
                        ? true
                        : !!state.token,
            }));

            return state;
        } catch (err) {
            console.error(err);
            toast.error("Failed to connect wallet");
            return null;
        }
    }, []);

    // ------------------ Account change ------------------
    const onAccountsChanged = async (accounts) => {
        if (!accounts || accounts.length === 0) {
            setWeb3State(INITIAL_STATE);
            return;
        }

        handleAccountChange(setWeb3State, accounts);
        await handleWallet();
    };

    // ------------------ Chain change ------------------
    const onChainChanged = async (chainIdHex) => {
        handleChainChange(setWeb3State, chainIdHex);
        await handleWallet();
    };

    // ------------------ Wallet listeners ------------------
    useEffect(() => {
        if (!window.ethereum) return;

        window.ethereum.on("accountsChanged", onAccountsChanged);
        window.ethereum.on("chainChanged", onChainChanged);

        return () => {
            if (!window.ethereum) return;
            window.ethereum.removeListener("accountsChanged", onAccountsChanged);
            window.ethereum.removeListener("chainChanged", onChainChanged);
        };
    }, []);

    // ------------------ Auto connect ------------------
    useEffect(() => {
        handleWallet();
    }, [handleWallet]);

    return (
        <Web3Context.Provider value={{ web3State, handleWallet }}>
            {children}
        </Web3Context.Provider>
    );
};

export default Web3Provider;
