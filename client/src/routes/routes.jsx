import { createBrowserRouter } from "react-router-dom";

// Components
import Navigation from "../components/Navigation/Navigation";
import NavbarPolice from "../components/Police/NavbarPolice";
import DashboardPolice from "../components/Police/DashboardPolice";
import FIRListPolice from "../components/Police/FIRListPolice";
import FIRDetailPolice from "../components/Police/FIRDetailPolice";
import NavbarGovt from "../components/Govt/NavbarGovt";
import ManagePolice from "../components/Govt/ManagePolice";

// User Pages
import RegisterFIR from "../pages/Candidate/RegisterFIR";
import TrackFIR from "../pages/Candidate/TrackFIR";
import About from "../pages/Description/About"

export const routes = createBrowserRouter([
    // ---------------- USERS ----------------
    {
        path: "/",
        element: (
            <div>
                <Navigation />
            </div>
        ),
    },
    {
        path: "/register",
        element: (
            <div>
                <Navigation />
                <RegisterFIR />
            </div>
        ),
    },
    {
        path: "/view",
        element: (
            <div>
                <Navigation />
                <TrackFIR />
            </div>
        ),
    },
    {
        path: "/about",
        element: (
            <div>
                <Navigation />
                <About />
            </div>
        ),
    },

    // ---------------- POLICE ----------------
    {
        path: "/police",
        element: (
            <div>
                <NavbarPolice />
            </div>
        ),
    },
    {
        path: "/police/dashboard",
        element: (
            <div>
                <NavbarPolice />
                <DashboardPolice />
            </div>
        ),
    },
    {
        path: "/police/firlist",
        element: (
            <div>
                <NavbarPolice />
                <FIRListPolice />
            </div>
        ),
    },
    {
        path: "/police/firdetail/:firId",
        element: (
            <div>
                <NavbarPolice />
                <FIRDetailPolice />
            </div>
        ),
    },

    // ---------------- GOVERNMENT ----------------
    {
        path: "/govt",
        element: (
            <div>
                <NavbarGovt />
            </div>
        ),
    },
    {
        path: "/govt/manage-police",
        element: (
            <div>
                <NavbarGovt />
                <ManagePolice />
            </div>
        ),
    },
]);
