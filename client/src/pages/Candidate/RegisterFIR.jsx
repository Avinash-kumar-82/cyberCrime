import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { useWeb3Context } from "../../context/userWeb3Context";
import { uploadToIPFS } from "../../utils/uploadToIPFS";
import { useNavigate } from "react-router-dom";

const FIR_TYPES = [
  "NOT_SPECIFIED",
  "FRAUD_CALL",
  "OTP_SCAMS",
  "ONLINE_HARASSMENT",
  "FINANCIAL_THEFT",
];

const RegisterFIR = () => {
  const { web3State } = useWeb3Context();
  const { contract, selectedAccount, chainId, relay } = web3State;

  const token = localStorage.getItem("token");
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!token) navigateTo("/view");
  }, [token, navigateTo]);

  const [firType, setFirType] = useState(0);
  const [accusedArray, setAccusedArray] = useState([
    { name: "", contactTypes: { mobile: false, email: false, social: false }, mobile: "", email: "", social: "" },
  ]);
  const [evidenceArray, setEvidenceArray] = useState([""]);
  const [descriptionArray, setDescriptionArray] = useState([""]);
  const [crimeDate, setCrimeDate] = useState("");

  /* ---------------- Helpers ---------------- */
  const handleChange = (setter, index, value) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddField = (setter) => setter((prev) => [...prev, ""]);

  /* ---------------- Accused handlers ---------------- */
  const handleAccusedChange = (index, field, value) => {
    setAccusedArray((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const toggleContactType = (index, type) => {
    setAccusedArray((prev) => {
      const updated = [...prev];
      const prevContactTypes = updated[index].contactTypes;
      const clearedValue = prevContactTypes[type] ? "" : updated[index][type];
      updated[index] = {
        ...updated[index],
        contactTypes: { ...prevContactTypes, [type]: !prevContactTypes[type] },
        [type]: clearedValue,
      };
      return updated;
    });
  };

  const addMoreAccused = () => {
    setAccusedArray((prev) => [
      ...prev,
      { name: "", contactTypes: { mobile: false, email: false, social: false }, mobile: "", email: "", social: "" },
    ]);
  };

  /* ---------------- IPFS ---------------- */
  const handleFileUpload = async (index, file) => {
    try {
      const toastId = toast.loading("Uploading to IPFS...");
      const ipfsHash = await uploadToIPFS(file);
      handleChange(setEvidenceArray, index, ipfsHash);
      toast.success("File uploaded ✅", { id: toastId });
    } catch {
      toast.error("IPFS upload failed");
    }
  };

  /* ---------------- Register FIR (Gasless via Gelato Relay) ---------------- */
  const registerFIR = async () => {
    if (!selectedAccount || !contract || !relay || !chainId) {
      return toast.error("Wallet not connected or contract not initialized");
    }

    const toastId = toast.loading("Submitting FIR gaslessly...");

    try {
      // Prepare FIR data
      const accused = accusedArray.map((a) => {
        const contacts = [];
        if (a.name) contacts.push(`Name: ${a.name}`);
        if (a.contactTypes.mobile) contacts.push(`Mobile: ${a.mobile}`);
        if (a.contactTypes.email) contacts.push(`Email: ${a.email}`);
        if (a.contactTypes.social) contacts.push(`Social: ${a.social}`);
        return contacts.join(" | ");
      });

      const evidence = evidenceArray.filter(Boolean).map((v) =>
        ethers.keccak256(ethers.toUtf8Bytes(v))
      );

      const description = descriptionArray.filter(Boolean);
      const crimeTimestamp = Math.floor(new Date(crimeDate).getTime() / 1000);

      // Encode function data
      const data = contract.interface.encodeFunctionData("registerFIR", [
        firType,
        accused,
        evidence,
        description,
        crimeTimestamp,
      ]);

      // ---------------- Gasless transaction via Gelato ----------------
      const relayResponse = await relay.sponsoredCall({
        chainId, // eg: 80002 for Polygon Amoy
        target: contract.target || contract.address,
        data,
        user: selectedAccount,
      });

      toast.success(`FIR Submitted! Task ID: ${relayResponse.taskId}`, { id: toastId });

      // Reset form
      setAccusedArray([{ name: "", contactTypes: { mobile: false, email: false, social: false }, mobile: "", email: "", social: "" }]);
      setEvidenceArray([""]);
      setDescriptionArray([""]);
      setCrimeDate("");
      setFirType(0);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Gasless registration failed", { id: toastId });
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-4xl mx-auto mt-12 p-8 bg-gray-900 text-gray-100 rounded-2xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-8 text-green-500">Register Cyber FIR 🚔</h2>

      {/* FIR Type */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2 text-green-400">Select Case Type</h3>
        <select
          className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-gray-200 focus:outline-none focus:border-green-500 transition"
          value={firType}
          onChange={(e) => setFirType(Number(e.target.value))}
        >
          {FIR_TYPES.map((t, i) => (
            <option key={i} value={i}>{t}</option>
          ))}
        </select>
      </div>

      {/* Accused */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4 text-green-400">Accused Details</h3>
        {accusedArray.map((a, idx) => (
          <div key={idx} className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
            <p className="text-sm text-gray-400 mb-2 font-medium">Accused #{idx + 1}</p>
            <input
              className="w-full mb-2 p-3 bg-gray-900 rounded-lg border border-gray-700 text-gray-200 focus:outline-none focus:border-green-500 transition"
              placeholder="Name (optional)"
              value={a.name}
              onChange={(e) => handleAccusedChange(idx, "name", e.target.value)}
            />
            <div className="flex flex-wrap gap-4 mb-2">
              {["mobile", "email", "social"].map((type) => (
                <label key={type} className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={a.contactTypes[type]}
                    className="accent-green-500"
                    onChange={() => toggleContactType(idx, type)}
                  />
                  {type.toUpperCase()}
                </label>
              ))}
            </div>
            {a.contactTypes.mobile && (
              <input
                className="w-full mb-2 p-3 bg-gray-900 rounded-lg border border-gray-700 text-gray-200 focus:outline-none focus:border-green-500 transition"
                placeholder="Mobile Number"
                value={a.mobile}
                onChange={(e) => handleAccusedChange(idx, "mobile", e.target.value)}
              />
            )}
            {a.contactTypes.email && (
              <input
                className="w-full mb-2 p-3 bg-gray-900 rounded-lg border border-gray-700 text-gray-200 focus:outline-none focus:border-green-500 transition"
                placeholder="Email Address"
                value={a.email}
                onChange={(e) => handleAccusedChange(idx, "email", e.target.value)}
              />
            )}
            {a.contactTypes.social && (
              <input
                className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 text-gray-200 focus:outline-none focus:border-green-500 transition"
                placeholder="Social Handle / URL"
                value={a.social}
                onChange={(e) => handleAccusedChange(idx, "social", e.target.value)}
              />
            )}
          </div>
        ))}
        <button
          className="text-green-400 hover:text-green-500 font-medium mb-6 transition"
          onClick={addMoreAccused}
        >
          + Add Another Accused
        </button>
      </div>

      {/* Evidence */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4 text-green-400">Evidence</h3>
        {evidenceArray.map((val, idx) => (
          <div key={idx} className="mb-3 p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
            {val ? (
              <div className="flex items-center justify-between text-sm text-green-400 mb-2">
                <span className="truncate">Uploaded: {val}</span>
                <span className="bg-green-600/20 px-2 py-1 rounded-full text-xs">Uploaded</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-2">No file uploaded yet</p>
            )}
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <span className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition">
                📁 Choose Evidence File
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => e.target.files[0] && handleFileUpload(idx, e.target.files[0])}
              />
            </label>
          </div>
        ))}
        <button
          className="text-green-400 hover:text-green-500 font-medium mb-6 transition"
          onClick={() => handleAddField(setEvidenceArray)}
        >
          + Add More Evidence
        </button>
      </div>

      {/* Description */}
      <div className="mb-6">
        {descriptionArray.map((v, i) => (
          <textarea
            key={i}
            className="w-full mb-3 p-4 bg-gray-800 rounded-lg border border-gray-700 text-gray-200 focus:outline-none focus:border-green-500 transition"
            value={v}
            onChange={(e) => handleChange(setDescriptionArray, i, e.target.value)}
            placeholder="Incident description"
            rows={3}
          />
        ))}
        <button
          className="text-green-400 hover:text-green-500 font-medium mb-6 transition"
          onClick={() => handleAddField(setDescriptionArray)}
        >
          + Add More Description
        </button>
      </div>

      {/* Crime Date */}
      <input
        type="date"
        className="w-full mb-6 p-3 bg-gray-800 rounded-lg border border-gray-700 text-gray-200 focus:outline-none focus:border-green-500 transition"
        value={crimeDate}
        onChange={(e) => setCrimeDate(e.target.value)}
      />

      {/* Submit Button */}
      <button
        className="w-full bg-green-600 hover:bg-green-700 p-4 rounded-lg font-semibold text-gray-100 transition shadow-lg hover:shadow-xl"
        onClick={registerFIR}
      >
        Submit FIR
      </button>
    </div>
  );
};

export default RegisterFIR;
