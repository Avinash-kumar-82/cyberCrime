import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-gray-950 border-t border-gray-800 text-gray-400 text-sm flex-shrink-0 mt-20" >
            <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* LOGO & DESCRIPTION */}
                <div>
                    <h2 className="text-lg font-bold text-emerald-400 mb-2">
                        FIR Blockchain DApp
                    </h2>
                    <p className="text-gray-400 leading-snug text-sm">
                        Secure, transparent, and decentralized FIR registration platform.
                    </p>
                </div>

                {/* QUICK LINKS */}
                <div>
                    <h3 className="font-semibold mb-2">Quick Links</h3>
                    <ul className="space-y-1 text-sm">
                        <li className="hover:text-emerald-400 cursor-pointer transition">Home</li>
                        <li className="hover:text-emerald-400 cursor-pointer transition">Register FIR</li>
                        <li className="hover:text-emerald-400 cursor-pointer transition">Track Cases</li>
                        <li className="hover:text-emerald-400 cursor-pointer transition">Contact</li>
                    </ul>
                </div>

                {/* RESOURCES */}
                <div>
                    <h3 className="font-semibold mb-2">Resources</h3>
                    <ul className="space-y-1 text-sm">
                        <li className="hover:text-emerald-400 cursor-pointer transition">Documentation</li>
                        <li className="hover:text-emerald-400 cursor-pointer transition">Blockchain Guide</li>
                        <li className="hover:text-emerald-400 cursor-pointer transition">Legal FAQs</li>
                        <li className="hover:text-emerald-400 cursor-pointer transition">Support</li>
                    </ul>
                </div>

                {/* SOCIAL LINKS */}
                <div>
                    <h3 className="font-semibold mb-2">Connect</h3>
                    <div className="flex space-x-3">
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition">
                            <FaTwitter size={16} />
                        </a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition">
                            <FaGithub size={16} />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition">
                            <FaLinkedin size={16} />
                        </a>
                    </div>
                </div>

            </div>

            {/* COPYRIGHT */}
            <div className="border-t border-gray-800 mt-2">
                <p className="text-center py-2 text-gray-500 text-xs">
                    © 2025 FIR Blockchain DApp • All Rights Reserved
                </p>
            </div>
        </footer>
    );
};

export default Footer;
