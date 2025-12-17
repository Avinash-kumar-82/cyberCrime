import { ethers } from "ethers";
import abi from "../constant/abi.json";
import axios from "axios";
import { toast } from "react-hot-toast";
export const getWeb3State = async () => {
    try {

        // window.ethereum--for checking any wallet
        // window.ethereum.isMetaMask ---> dedicated to metamask
        if (!window.ethereum || !window.ethereum.isMetaMask) {
            window.location.href = "https://metamask.io/download/";
            return null;
        }
        // Check already connected accounts
        const existingAccounts = await window.ethereum.request({ method: "eth_accounts" });

        if (existingAccounts.length > 0) {
            // Wallet already connected
            toast("Wallet already connected", { icon: "🔗" });
            const selectedAccount = existingAccounts[0];

            const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
            const chainId = parseInt(chainIdHex, 16);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contractAddress = import.meta.env.VITE_CONTRACTADDRESS;
            const contractInstance = new ethers.Contract(contractAddress, abi, signer);

            return { contractInstance, selectedAccount, chainId, signer, provider };
        }
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const selectedAccount = accounts[0];
        toast.success("Wallet connected successfully", { icon: "🎉" });
        const chainIdHex = await window.ethereum.request({
            method: 'eth_chainId'
        })
        const chainId = parseInt(chainIdHex, 16);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = import.meta.env.VITE_CONTRACTADDRESS;
        // const res = await axios.post(`http://localhost:3000/api/authentication?accountAddress=${selectedAccount}`, dataSignature);
        // localStorage.setItem("token", res.data.token);
        const contractInstance = new ethers.Contract(contractAddress, abi, signer);
        return { contractInstance, selectedAccount, chainId, signer, provider };
    } catch (error) {
        console.error(error);
        toast.error("Error connecting wallet", { icon: "❌" });
        return null;
    }
}