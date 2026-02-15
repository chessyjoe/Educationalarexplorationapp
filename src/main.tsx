import { createRoot } from "react-dom/client";
import { StrictMode, useEffect } from "react";
import App from "./app/App.tsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.tsx";
import { registerAuthTokenGetter } from "./services/apiService.ts";
import "./styles/index.css";

// Wrapper component to register auth token getter
function AppWithAuth() {
    const { getIdToken } = useAuth();

    useEffect(() => {
        // Register the auth token getter with API service
        registerAuthTokenGetter(getIdToken);
    }, [getIdToken]);

    return <App />;
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <AppWithAuth />
        </AuthProvider>
    </StrictMode>
);
