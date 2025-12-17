import { Link, useLocation } from "react-router-dom";
import { Home, UserPlus, FolderOpen, Info, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Wallet from "../Wallet/Wallet";
const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/register", label: "Register", icon: UserPlus },
    { to: "/view", label: "View Cases", icon: FolderOpen },
    { to: "/about", label: "About", icon: Info },
];

const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <nav className="bg-nav/95 backdrop-blur-xl border-b border-nav-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link
                            to="/"
                            className="flex items-center gap-3 group"
                        >
                            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow transition-transform duration-300 group-hover:scale-105">
                                <span className="text-primary-foreground font-bold text-lg">C</span>
                            </div>
                            <span className="text-nav-foreground font-display font-semibold text-xl hidden sm:block">
                                CaseFlow
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <ul className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.to;
                                const Icon = item.icon;

                                return (
                                    <li key={item.to}>
                                        <Link
                                            to={item.to}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                                isActive
                                                    ? "bg-nav-accent/15 text-nav-accent"
                                                    : "text-nav-foreground/70 hover:text-nav-foreground hover:bg-nav-hover"
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* CTA Button */}
                        <div className="hidden md:block">
                            <button
                                onClick={Wallet}
                                className="gradient-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold shadow-glow hover:opacity-90 transition-all duration-200 hover:scale-105"
                            >
                                Connect Wallet
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 rounded-lg text-nav-foreground hover:bg-nav-hover transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div
                    className={cn(
                        "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
                        isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
                    )}
                >
                    <ul className="px-4 py-3 space-y-1 border-t border-nav-border">
                        {navItems.map((item, index) => {
                            const isActive = location.pathname === item.to;
                            const Icon = item.icon;

                            return (
                                <li
                                    key={item.to}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    className={isOpen ? "animate-slide-in" : ""}
                                >
                                    <Link
                                        to={item.to}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-nav-accent/15 text-nav-accent"
                                                : "text-nav-foreground/70 hover:text-nav-foreground hover:bg-nav-hover"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                        <li className="pt-2">
                            <Link
                                to="/register"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 gradient-primary text-primary-foreground px-4 py-3 rounded-lg text-sm font-semibold"
                            >
                                Get Started
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Navigation;
