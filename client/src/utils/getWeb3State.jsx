import { ethers } from "ethers";
import abi from "../constant/abi.json";
import axios from "axios";
import { toast } from "react-hot-toast";
import { GelatoRelay } from "@gelatonetwork/relay-sdk";

const relay = new GelatoRelay();

export const getWeb3State = async () => {
    try {
        // ------------------ MetaMask check ------------------
        if (!window.ethereum) {
            toast.error("MetaMask not installed");
            return null;
        }

        // ------------------ Connect wallet ------------------
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const selectedAccount = await signer.getAddress();

        // ------------------ Chain ID ------------------
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        // ------------------ Contract ------------------
        const contractAddress = import.meta.env.VITE_CONTRACTADDRESS;
        const contract = new ethers.Contract(contractAddress, abi, signer);

        // ------------------ Role detection ------------------
        let role = "user";
        try {
            const isPolice = await contract.isPolice(selectedAccount);
            const isGovt = await contract.isGovernment(selectedAccount);
            if (isGovt) role = "owner";
            else if (isPolice) role = "police";
        } catch {
            console.warn("Role check skipped");
        }

        // ------------------ One-time authentication ------------------
        let token = localStorage.getItem("token");

        if (!token) {
            try {
                const message = `Authenticate wallet ${selectedAccount} for CyberCrime DApp`;
                const signature = await signer.signMessage(message);

                const res = await axios.post(
                    `http://localhost:3000/api/authentication?accountAddress=${selectedAccount}`,
                    { signature }
                );

                token = res.data.token;
                localStorage.setItem("token", token);
            } catch (err) {
                if (err.code === 4001) {
                    toast.error("Signature rejected");
                } else {
                    console.error(err);
                    toast.error("Authentication failed");
                }
            }
        }

        // ------------------ Return Web3 State ------------------
        return {
            provider,
            signer,
            contract,
            contractAddress,
            selectedAccount,
            chainId,
            role,
            token,
            isAuthenticated: !!token,

            // Gelato Relay (gasless)
            relay,
        };
    } catch (err) {
        console.error(err);
        toast.error("Wallet connection failed");
        return null;
    }
};
