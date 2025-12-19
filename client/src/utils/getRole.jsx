// utils/getRole.js
import { ethers } from "ethers";
import { getWeb3State } from "./getWeb3State";

export const detectRole = async () => {
    try {
        const web3 = await getWeb3State();
        if (!web3) return null;

        const { signer, contractInterface, contractAddress, selectedAccount } = web3;
        const contract = new ethers.Contract(contractAddress, contractInterface, signer);

        // 1. Check if Government
        const government = await contract.government();
        if (selectedAccount.toLowerCase() === government.toLowerCase()) return "government";

        // 2. Check if Police
        const isPolice = await contract.policeWallets(selectedAccount);
        if (isPolice) return "police";

        // 3. Default → User
        return "user";
    } catch (err) {
        console.error(err);
        return null;
    }
};
