import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";

export default function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}
