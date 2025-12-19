import { NavLink } from "react-router-dom";
import Wallet from "../Wallet/Wallet";

const Navigation = () => {
    const linkClasses = ({ isActive }) =>
        `px-4 py-2 rounded-lg transition-colors ${isActive
            ? "bg-emerald-600 text-white"
            : "text-gray-300 hover:bg-gray-700/40"
        }`;

    return (
        <nav className="bg-gray-800 text-gray-300 p-4 shadow-md">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                {/* Left: Logo / Title */}
                <div className="text-white font-bold text-lg">FIR DApp</div>

                {/* Center: Navigation Links */}
                <div className="flex gap-2">
                    <NavLink to="/" className={linkClasses}>
                        Home
                    </NavLink>
                    <NavLink to="/register" className={linkClasses}>
                        Register FIR
                    </NavLink>
                    <NavLink to="/view" className={linkClasses}>
                        Track FIR
                    </NavLink>
                    <NavLink to="/about" className={linkClasses}>
                        About
                    </NavLink>
                </div>

                {/* Right: Wallet */}
                <div>
                    <Wallet compact={true} />
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
