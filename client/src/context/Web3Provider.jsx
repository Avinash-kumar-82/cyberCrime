import { useEffect, useState } from "react";
import { Web3Context } from "./web3Context";
import { getWeb3State } from "../utils/getWeb3State";
import { toast } from "react-hot-toast";

const Web3Provider = ({ children }) => {
    const [web3State, setWeb3State] = useState({
        smartAccount: null,
        smartAccountAddress: null,
        selectedAccount: null,
        chainId: null,
        provider: null,
        signer: null,
        contractInterface: null,
        contractAddress: null,
    });

    // ✅ ONLY runs on button click
    const handleWallet = async () => {
        try {
            const state = await getWeb3State();
            if (!state) return;
            setWeb3State(state);
        } catch (error) {
            console.error(error);
            toast.error("Failed to connect wallet");
        }
    };

    // ✅ SAFE listeners (NO ethers calls)
    useEffect(() => {
        if (!window.ethereum) return;

        const onAccountsChanged = () => {
            // reset state only
            setWeb3State({
                smartAccount: null,
                smartAccountAddress: null,
                selectedAccount: null,
                chainId: null,
                provider: null,
                signer: null,
                contractInterface: null,
                contractAddress: null,
            });
        };

        const onChainChanged = () => {
            // force reload is safest with ethers v6
            window.location.reload();
        };

        window.ethereum.on("accountsChanged", onAccountsChanged);
        window.ethereum.on("chainChanged", onChainChanged);

        return () => {
            window.ethereum.removeListener("accountsChanged", onAccountsChanged);
            window.ethereum.removeListener("chainChanged", onChainChanged);
        };
    }, []);

    return (
        <Web3Context.Provider value={{ web3State, handleWallet }}>
            {children}
        </Web3Context.Provider>
    );
};

export default Web3Provider;
