import axios from "axios";

export const uploadToIPFS = async (file) => {
    try {
        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
        const formData = new FormData();
        formData.append("file", file);

        const res = await axios.post(url, formData, {
            maxBodyLength: "Infinity", // to prevent payload size errors
            headers: {
                "Content-Type": "multipart/form-data",
                pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
                pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
            },
        });

        // Return IPFS hash
        return res.data.IpfsHash;
    } catch (err) {
        console.error("IPFS upload error:", err);
        return null;
    }
};
