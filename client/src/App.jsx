
import { Toaster } from "react-hot-toast";
import "./App.css";

const App = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Toaster position="top" reverseOrder={false} />
        {/* RouterProvider renders your routes from main.jsx */}
      </main>
    </div>
  );
};

export default App;
