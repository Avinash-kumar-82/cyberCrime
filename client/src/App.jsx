import Web3Provider from './context/Web3Provider';
import { routes } from "./routes/routes";
import { RouterProvider } from "react-router-dom";
// import "./App.css"
const App = () => {
  return (
    <>
      <Web3Provider>
        <RouterProvider router={routes} />
      </Web3Provider>
    </>
  )
}

export default App