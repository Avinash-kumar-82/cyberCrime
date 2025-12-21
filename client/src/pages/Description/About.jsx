import { FaShieldAlt, FaUsers, FaClipboardCheck, FaLock, FaRegFileAlt, FaRegHandshake } from "react-icons/fa";

const caseTypes = [
    {
        title: "Fraud Call",
        description:
            "Reports of fraudulent calls aimed at tricking users into giving personal information or money. Our system logs all complaints securely and provides guidance on next steps.",
        icon: <FaShieldAlt className="text-green-600 w-8 h-8" />,
    },
    {
        title: "OTP Scams",
        description:
            "Cases where scammers try to steal your OTP to access bank accounts or wallets. Users are guided to immediately report to their bank while blockchain ensures proof of filing.",
        icon: <FaLock className="text-green-600 w-8 h-8" />,
    },
    {
        title: "Online Harassment",
        description:
            "Any form of online harassment, stalking, or cyberbullying. Victims can report incidents securely, and police verification ensures prompt action.",
        icon: <FaUsers className="text-blue-600 w-8 h-8" />,
    },
    {
        title: "Financial Theft",
        description:
            "Unauthorized financial transactions, phishing attacks, or crypto scams. Must be reported within 72 hours. Blockchain ensures tamper-proof evidence storage for investigations.",
        icon: <FaClipboardCheck className="text-blue-600 w-8 h-8" />,
    },
];

const services = [
    {
        title: "Anonymous FIR Registration",
        description:
            "Users can file FIRs anonymously using MetaMask or gasless Biconomy Smart Accounts. No personal info is required unless the user chooses to share.",
        icon: <FaRegFileAlt className="text-blue-600 w-10 h-10" />,
    },
    {
        title: "Secure Evidence Storage",
        description:
            "All evidence uploaded is stored on IPFS and hashed on the blockchain, ensuring immutability and transparency.",
        icon: <FaLock className="text-blue-600 w-10 h-10" />,
    },
    {
        title: "Government & Police Verification",
        description:
            "Authorized police and government accounts can verify, reject, or add remarks to FIRs. This ensures cases are processed efficiently.",
        icon: <FaClipboardCheck className="text-blue-600 w-10 h-10" />,
    },
    {
        title: "Transparent Tracking",
        description:
            "Each FIR comes with a unique tracking ID that users can check at any time to see the status, updates, and police remarks.",
        icon: <FaRegHandshake className="text-blue-600 w-10 h-10" />,
    },
];

const About = () => {
    return (
        <div className="max-w-6xl mx-auto p-8 space-y-20">
            {/* Header */}
            <header className="text-center space-y-4">
                <h1 className="text-5xl font-extrabold text-blue-600">Cyber Crime Reporting System</h1>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                    A decentralized platform enabling citizens to report cyber crimes securely, anonymously, and transparently.
                    Every FIR is tracked via blockchain to ensure tamper-proof records.
                </p>
            </header>

            {/* How It Works */}
            <section className="space-y-8">
                <h2 className="text-3xl font-bold text-blue-600 text-center">How It Works</h2>
                <ol className="list-decimal list-inside text-gray-700 space-y-4 max-w-4xl mx-auto">
                    <li>
                        Users register FIRs anonymously via MetaMask or gasless Biconomy Smart Accounts.
                    </li>
                    <li>
                        Evidence and descriptions are uploaded securely to IPFS, and hashes are stored on blockchain.
                    </li>
                    <li>
                        Government/police wallets verify, approve, or reject FIRs based on investigation.
                    </li>
                    <li>
                        Users can track their case using a unique tracking ID and view police remarks.
                    </li>
                    <li>
                        Immutable blockchain storage ensures transparency and accountability for all parties.
                    </li>
                </ol>
            </section>

            {/* Services */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold text-blue-600 text-center mb-8">Our Services</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {services.map((service, idx) => (
                        <div key={idx} className="p-6 bg-white rounded-xl shadow hover:shadow-xl transition flex gap-4 items-start">
                            {service.icon}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{service.title}</h3>
                                <p className="text-gray-600 mt-1">{service.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Case Types */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold text-blue-600 text-center mb-8">Types of Cases</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {caseTypes.map((caseType, idx) => (
                        <div key={idx} className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col items-start gap-4">
                            {caseType.icon}
                            <h3 className="text-xl font-bold text-gray-800">{caseType.title}</h3>
                            <p className="text-gray-600">{caseType.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefits / Features */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold text-blue-600 text-center mb-8">Benefits & Features</h2>
                <ul className="grid md:grid-cols-2 gap-4 text-gray-700 list-disc list-inside">
                    <li>Secure, anonymous, and decentralized FIR filing.</li>
                    <li>Blockchain ensures tamper-proof evidence storage and transparency.</li>
                    <li>Quick verification and tracking by authorized government/police.</li>
                    <li>Gasless smart accounts for low-cost, user-friendly transactions.</li>
                    <li>Complete FIR history for each user, enhancing accountability.</li>
                    <li>Real-time updates and police remarks accessible to users.</li>
                </ul>
            </section>
        </div>
    );
};

export default About;
