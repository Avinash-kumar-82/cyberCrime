import { createBrowserRouter } from "react-router-dom";
import Wallet from "../components/Wallet/Wallet";
import RegisterCase from "../pages/User/RegisterCase";
import Navigation from "../components/Navigation/Navigation";
import ViewCase from "../pages/User/ViewCase";
import About from "../pages/Description/About";
export const routes = createBrowserRouter([
    {
        path: '/', element: (
            <div>
                <Navigation />
                <Wallet />
            </div>
        )
    },
    {
        path: '/register', element: (
            <div>
                <Navigation />
                < RegisterCase />
            </div>
        )
    },
    {
        path: '/view', element: (
            <div>
                <Navigation />
                <ViewCase />
            </div>
        )
    },
    {
        path: '/about', element: (
            <div>
                <Navigation />
                <About />
            </div>
        )
    }
])