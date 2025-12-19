import { useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { getWeb3State } from "../../utils/getWeb3State";
import { uploadToIPFS } from "../../utils/uploadToIPFS";

const FIR_TYPES = [
  "NOT_SPECIFIED",
  "FRAUD_CALL",
  "OTP_SCAMS",
  "ONLINE_HARASSMENT",
  "FINANCIAL_THEFT",
];

const RegisterFIR = () => {
  const [firType, setFirType] = useState(0);
  const [accusedArray, setAccusedArray] = useState([""]);
  const [evidenceArray, setEvidenceArray] = useState([""]);
  const [descriptionArray, setDescriptionArray] = useState([""]);
  const [crimeDate, setCrimeDate] = useState("");

  const handleChange = (setter, index, value) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddField = (setter) => setter((prev) => [...prev, ""]);

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

  const registerFIR = async () => {
    const toastId = toast.loading("Submitting FIR...");
    try {
      const web3 = await getWeb3State();
      if (!web3) {
        toast.dismiss(toastId);
        return;
      }
      const { smartAccount, contractInterface, contractAddress } = web3;

      const accused = accusedArray.filter((v) => v.trim() !== "");
      const evidence = evidenceArray
        .filter((v) => v.trim() !== "")
        .map((v) => ethers.keccak256(ethers.toUtf8Bytes(v)));
      const description = descriptionArray.filter((v) => v.trim() !== "");
      const crimeTimestamp = Math.floor(new Date(crimeDate).getTime() / 1000);

      const data = contractInterface.encodeFunctionData("registerFIR", [
        firType,
        accused,
        evidence,
        description,
        crimeTimestamp,
      ]);

      const userOpResponse = await smartAccount.sendTransaction({
        to: contractAddress,
        data,
      });
      await userOpResponse.wait();

      toast.success("FIR Registered Successfully 🚨", { id: toastId });
      setAccusedArray([""]);
      setEvidenceArray([""]);
      setDescriptionArray([""]);
      setCrimeDate("");
    } catch (error) {
      console.error(error);
      toast.error(error?.reason || error?.message || "FIR registration failed", {
        id: toastId,
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-gray-900 text-gray-200 rounded-xl shadow-xl">
      <h2 className="text-3xl font-bold text-center mb-6 text-white">
        Register Cyber FIR 🚔
      </h2>

      {/* FIR Type */}
      <div className="mb-4">
        <label className="font-semibold text-gray-200">FIR Type</label>
        <select
          className="w-full mt-2 p-2 border border-gray-700 rounded-md bg-gray-800 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          value={firType}
          onChange={(e) => setFirType(Number(e.target.value))}
        >
          {FIR_TYPES.map((type, idx) => (
            <option key={idx} value={idx} className="bg-gray-800 text-gray-200">
              {type}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-400 mt-1">
          Select the type of cybercrime you want to report.
        </p>
      </div>

      {/* Accused */}
      <div className="mb-4">
        <label className="font-semibold text-gray-200">Accused Details</label>
        {accusedArray.map((val, idx) => (
          <input
            key={idx}
            type="text"
            className="w-full mt-2 p-2 border border-gray-700 rounded-md bg-gray-800 text-gray-200 placeholder-gray-400"
            value={val}
            placeholder="Full name, email, or contact of accused"
            onChange={(e) => handleChange(setAccusedArray, idx, e.target.value)}
          />
        ))}
        <p className="text-sm text-gray-400 mt-1">
          Provide as much detail as possible to identify the accused.
        </p>
        <button
          type="button"
          className="text-blue-400 mt-1 hover:underline"
          onClick={() => handleAddField(setAccusedArray)}
        >
          + Add More Accused
        </button>
      </div>

      {/* Evidence */}
      <div className="mb-4">
        <label className="font-semibold text-gray-200">Evidence</label>
        {evidenceArray.map((val, idx) => (
          <div key={idx} className="flex gap-2 mt-2">
            <input
              type="text"
              className="flex-1 p-2 border border-gray-700 rounded-md bg-gray-800 text-gray-200 placeholder-gray-400"
              value={val}
              placeholder="Uploaded file hash"
              readOnly
            />
            <input
              type="file"
              className="border border-gray-700 p-1 rounded-md bg-gray-800 text-gray-200"
              onChange={(e) =>
                e.target.files[0] && handleFileUpload(idx, e.target.files[0])
              }
            />
          </div>
        ))}
        <p className="text-sm text-gray-400 mt-1">
          Upload screenshots, documents, or links related to the incident.
        </p>
        <button
          type="button"
          className="text-blue-400 mt-1 hover:underline"
          onClick={() => handleAddField(setEvidenceArray)}
        >
          + Add More Evidence
        </button>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="font-semibold text-gray-200">Description</label>
        {descriptionArray.map((val, idx) => (
          <textarea
            key={idx}
            className="w-full mt-2 p-2 border border-gray-700 rounded-md bg-gray-800 text-gray-200 placeholder-gray-400"
            value={val}
            placeholder="Describe the incident: what happened, when, how it affected you, and any supporting details"
            onChange={(e) =>
              handleChange(setDescriptionArray, idx, e.target.value)
            }
          />
        ))}
        <p className="text-sm text-gray-400 mt-1">
          Provide a detailed description of the incident. Include times, dates, and context.
        </p>
        <button
          type="button"
          className="text-blue-400 mt-1 hover:underline"
          onClick={() => handleAddField(setDescriptionArray)}
        >
          + Add More Description
        </button>
      </div>

      {/* Crime Date */}
      <div className="mb-6">
        <label className="font-semibold text-gray-200">Crime Date</label>
        <input
          type="date"
          className="w-full mt-2 p-2 border border-gray-700 rounded-md bg-gray-800 text-gray-200 placeholder-gray-400"
          value={crimeDate}
          onChange={(e) => setCrimeDate(e.target.value)}
        />
        <p className="text-sm text-gray-400 mt-1">
          Select the date when the cybercrime occurred.
        </p>
      </div>

      {/* Submit */}
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-md font-semibold transition"
        onClick={registerFIR}
      >
        Submit FIR
      </button>
    </div>
  );
};

export default RegisterFIR;
