const caseTypes = [
    {
        title: "Fraud Call",
        description:
            "Reports of fraudulent calls aimed at tricking users into giving personal information or money.",
    },
    {
        title: "OTP Scams",
        description:
            "Cases where scammers try to steal your OTP to access bank accounts or wallets.",
    },
    {
        title: "Online Harassment",
        description:
            "Any form of online harassment, stalking, or cyberbullying reported by users.",
    },
    {
        title: "Financial Theft",
        description:
            "Cases of unauthorized financial transactions, phishing attacks, or crypto scams. Must be reported within 72 hours.",
    },
];

const About = () => {
    return (
        <div className="max-w-5xl mx-auto p-6 space-y-10">
            <h1 className="text-4xl font-bold text-center text-blue-600">
                Cyber Crime Reporting System
            </h1>

            <section className="text-center">
                <p className="text-lg text-gray-700">
                    Our decentralized platform allows citizens to report cyber crimes securely and anonymously.
                    Every FIR is tracked via blockchain, ensuring transparency and tamper-proof records.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-6 text-blue-600">
                    How It Works
                </h2>
                <ul className="space-y-4 list-decimal list-inside text-gray-700">
                    <li>
                        Users register FIRs anonymously using MetaMask and optionally via gasless Biconomy Smart Accounts.
                    </li>
                    <li>
                        Government/police wallets can verify, reject, or update FIRs.
                    </li>
                    <li>
                        Users can track the status of their cases anytime using the unique tracking ID.
                    </li>
                    <li>
                        All records are securely stored on the blockchain for transparency.
                    </li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-6 text-blue-600">
                    Types of Cases
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {caseTypes.map((caseType, idx) => (
                        <div
                            key={idx}
                            className="p-4 border rounded-lg shadow hover:shadow-lg transition duration-300 bg-white"
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {caseType.title}
                            </h3>
                            <p className="text-gray-600">{caseType.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 text-blue-600">
                    Features
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Anonymous FIR registration and blockchain-based tracking.</li>
                    <li>Government verification with transparent police remarks.</li>
                    <li>Easy access to FIR history for each user account.</li>
                    <li>Gasless transactions supported via Biconomy Smart Accounts.</li>
                    <li>Immutable records ensuring accountability and trust.</li>
                </ul>
            </section>
        </div>
    );
};

export default About;
