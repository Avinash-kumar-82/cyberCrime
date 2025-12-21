import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/Home"
import Footer from "../components/Footer/Footer";
// Shared Navigation (Users)
import Navigation from "../components/Navigation/Navigation";

// Police / Govt (SAME NAVBAR)
import NavbarPolice from "../components/Police/NavbarPolice";

// Police Pages
import DashboardPolice from "../components/Police/DashboardPolice";
import FIRListPolice from "../components/Police/FIRListPolice";
import FIRDetailPolice from "../components/Police/FIRDetailPolice";

// Govt Page
import ManagePolice from "../components/Govt/ManagePolice";

// User Pages
import RegisterFIR from "../pages/Candidate/RegisterFIR";
import TrackFIR from "../pages/Candidate/TrackFIR";
import About from "../pages/Description/About";

export const routes = createBrowserRouter([
    // Root
    {
        path: "/",
        element: (
            <>
                <Navigation />
                <Home />
                <Footer />

            </>

        ),
    },

    // ---------------- USERS ----------------
    {
        path: "/register",
        element: (
            <>
                <Navigation />
                <RegisterFIR />
                <Footer />
            </>
        ),
    },
    {
        path: "/view",
        element: (
            <>
                <Navigation />
                <TrackFIR />
                <Footer />
            </>
        ),
    },
    {
        path: "/about",
        element: (
            <>
                <Navigation />
                <About />
                <Footer />
            </>
        ),
    },

    // ---------------- POLICE & GOVT ----------------
    {
        path: "/police/dashboard",
        element: (
            <>
                <NavbarPolice />
                <DashboardPolice />
            </>
        ),
    },
    {
        path: "/police/firlist",
        element: (
            <>
                <NavbarPolice />
                <FIRListPolice />
            </>
        ),
    },
    {
        path: "/police/firdetail/:firId",
        element: (
            <>
                <NavbarPolice />
                <FIRDetailPolice />
            </>
        ),
    },

    // ---------------- GOVERNMENT ONLY ----------------
    {
        path: "/govt/manage-police",
        element: (
            <>
                <NavbarPolice />
                <ManagePolice />
            </>
        ),
    },
]);
