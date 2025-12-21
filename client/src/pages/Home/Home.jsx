import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import Wallet from "../../components/Wallet/Wallet";
const Home = () => {
    const [openCase, setOpenCase] = useState(null);

    const caseTypes = [
        {
            id: "money",
            title: "💰 Financial Fraud / Money Theft",
            desc: "UPI scams, online fraud, ATM fraud, unauthorized transactions.",
            time: "File FIR within 72 hours",
            color: "emerald",
        },
        {
            id: "property",
            title: "📱 Mobile / Property Theft",
            desc: "Mobile phones, vehicles, valuables theft.",
            time: "File FIR within 24 hours",
            color: "emerald",
        },
        {
            id: "cyber",
            title: "🖥 Cyber Crime",
            desc: "Hacking, impersonation, harassment, fake profiles.",
            time: "File FIR within 48 hours",
            color: "emerald",
        },
        {
            id: "emergency",
            title: "🚨 Violent Crime / Emergency",
            desc: "Assault, kidnapping, domestic violence.",
            time: "File FIR immediately",
            color: "red",
        },
    ];

    const registrationSteps = [
        "Connect wallet for identity verification",
        "Select FIR case type",
        "Enter incident details truthfully",
        "Upload evidence securely",
        "Submit FIR to blockchain",
        "Police verification & investigation",
        "Track case status anytime",
    ];

    return (
        <div className="bg-gray-950 text-gray-200">

            {/* ================= HERO ================= */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-gray-950 to-gray-950" />
                <div className="relative max-w-7xl mx-auto px-6 py-20">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                        Blockchain-Based FIR Registration & Case Tracking System
                    </h1>
                    <p className="text-lg text-gray-400 max-w-5xl leading-relaxed">
                        Secure government-grade platform for citizens to register FIRs.
                        Records are <span className="text-emerald-400 font-semibold">immutable, verifiable, and legally protected</span> using blockchain.
                    </p>
                    <div className="mt-10 flex flex-wrap items-center gap-6">
                        <Wallet />
                        <span className="text-sm text-gray-500">
                            Wallet-based authentication • No passwords
                        </span>
                    </div>
                </div>
            </section>

            {/* ================= CASE TYPES ================= */}
            <section className="border-t border-gray-800 bg-gray-900">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <h2 className="text-3xl font-semibold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                        FIR Case Types & Reporting Timelines
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {caseTypes.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => setOpenCase(c.id)}
                                className={`bg-gray-800 p-6 rounded-2xl border border-gray-700 cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl hover:border-${c.color}-400`}
                            >
                                <h3 className="text-xl font-semibold mb-3">{c.title}</h3>
                                <p className="text-gray-400 mb-2">{c.desc}</p>
                                <p className={`text-${c.color}-400 font-medium`}>{c.time}</p>
                            </div>
                        ))}
                    </div>

                    {openCase && (
                        <div className="mt-12 bg-gray-950 p-8 rounded-2xl border border-gray-800 shadow-lg transition-all duration-500">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-semibold">FIR Filing Requirements</h3>
                                <button
                                    onClick={() => setOpenCase(null)}
                                    className="text-sm text-gray-400 hover:text-gray-200"
                                >
                                    Close ✕
                                </button>
                            </div>
                            <ul className="space-y-4">
                                {["Incident date, time & exact location",
                                    "Detailed incident description",
                                    "Evidence (screenshots, documents, media)",
                                    "Witness information (if available)"].map((item) => (
                                        <li key={item} className="flex items-start space-x-3">
                                            <FaCheckCircle className="mt-1 text-emerald-400" />
                                            <span className="text-gray-400">{item}</span>
                                        </li>
                                    ))}
                            </ul>
                            <p className="mt-4 text-yellow-400">
                                ⚠ Delayed FIR filing may weaken legal action.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* ================= REGISTRATION PROCESS ================= */}
            <section className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <h2 className="text-3xl font-semibold mb-10 text-center text-emerald-400">
                        FIR Registration Process
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {registrationSteps.map((step, index) => (
                            <div key={index} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex items-start gap-4 transform transition hover:scale-105 hover:shadow-lg duration-300">
                                <FaCheckCircle className="text-emerald-400 mt-1" />
                                <p className="text-gray-400">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
