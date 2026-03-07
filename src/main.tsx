import { createRoot } from "react-dom/client";
import { StrictMode, useEffect } from "react";
import * as Sentry from "@sentry/react";
import App from "./app/App.tsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.tsx";
import { registerAuthTokenGetter } from "./services/apiService.ts";
import "./styles/index.css";

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    tracePropagationTargets: ["localhost", /^https:\/\/pip-backend\.fly\.dev\/api/],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    enabled: !!import.meta.env.VITE_SENTRY_DSN,
});

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
