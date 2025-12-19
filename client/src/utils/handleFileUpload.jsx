import { uploadToIPFS } from "./handleFileUpload";
const handleFileUpload = async (index, file) => {
    try {
        const toastId = toast.loading("Uploading file to IPFS...");
        const ipfsHash = await uploadToIPFS(file);
        if (!ipfsHash) throw new Error("IPFS upload failed");

        handleChange(setEvidenceArray, index, ipfsHash);
        toast.success("File uploaded ✅", { id: toastId });
    } catch (err) {
        console.error(err);
        toast.error("File upload failed");
    }
};
