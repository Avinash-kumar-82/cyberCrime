import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import { routes } from "./routes/routes"; // your react-router v6 routes
import Web3Provider from "./context/Web3Provider";

const App = () => (
  <Web3Provider>
    <div className="min-h-screen bg-background">
      <Toaster position="top" reverseOrder={false} />
      <RouterProvider router={routes} />
    </div>
  </Web3Provider>
);

export default App;
