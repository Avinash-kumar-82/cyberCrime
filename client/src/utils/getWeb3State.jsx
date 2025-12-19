import { ethers } from "ethers";
import abi from "../constant/abi.json";
import { createSmartAccountClient } from "@biconomy/account";
import axios from "axios";
import { toast } from "react-hot-toast";

export const getWeb3State = async () => {
    try {
        if (!window.ethereum || !window.ethereum.isMetaMask) {
            toast.error("MetaMask is not installed");
            return null;
        }

        // Try silent account fetch
        let accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (!accounts || accounts.length === 0) {
            accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        }

        if (!accounts || accounts.length === 0) {
            toast.error("No account selected");
            return null;
        }

        const selectedAccount = accounts[0];

        // Chain ID
        const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
        const chainId = parseInt(chainIdHex, 16);

        // Provider & signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Contract
        const contractAddress = import.meta.env.VITE_CONTRACTADDRESS;
        const contractInterface = new ethers.Interface(abi);

        // Biconomy setup
        const apiKey = import.meta.env.VITE_BICONOMY_API_KEY;
        const envChainId = import.meta.env.VITE_CHAIN_ID;

        const bundlerUrl = `https://bundler.biconomy.io/api/v2/${envChainId}/${apiKey}`;
        const paymasterUrl = `https://paymaster.biconomy.io/api/v1/${envChainId}/${apiKey}`;

        const smartAccount = await createSmartAccountClient({
            signer,
            bundlerUrl,
            paymasterUrl,
        });

        const smartAccountAddress = await smartAccount.getAccountAddress();

        // Attempt backend authentication
        let token = null;
        try {
            const message = "Register cyberCrime Reports. You accept our terms and conditions";
            const signature = await signer.signMessage(message);

            const res = await axios.post(
                `http://localhost:3000/api/authentication?accountAddress=${selectedAccount}`,
                { signature }
            );

            token = res.data.token;
            localStorage.setItem("token", token);
        } catch (signError) {
            if (signError.code === 4001) {
                toast.error("MetaMask signature rejected. Authentication skipped.");
            } else {
                console.error(signError);
                toast.error("Authentication failed. Check console.");
            }
        }

        return {
            provider,
            signer,
            selectedAccount,
            chainId,
            smartAccount,
            smartAccountAddress,
            contractAddress,
            contractInterface,
            token, // might be null if signing rejected
        };
    } catch (error) {
        console.error(error);
        toast.error("Wallet connection failed");
        return null;
    }
};
