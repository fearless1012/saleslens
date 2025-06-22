import { Provider } from "react-redux";
import { store } from "@/state/store";
import { AuthProvider } from "@/Providers/AuthProvider";
import AllRoutes from "@/route/AllRoutes";

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AllRoutes />
      </AuthProvider>
    </Provider>
  );
}

export default App;
