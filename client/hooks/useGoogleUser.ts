import { useState, useEffect, useCallback } from "react";

const GOOGLE_CLIENT_ID = "868753375053-j0su2c5g1bl4r6i1h72l5juvvnfurh90.apps.googleusercontent.com";
const STORAGE_KEY = "galeria_google_user";

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).google?.accounts) { resolve(); return; }
    if (document.getElementById("google-gis-script")) {
      const interval = setInterval(() => {
        if ((window as any).google?.accounts) { clearInterval(interval); resolve(); }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gis-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export function useGoogleUser() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) setUser(JSON.parse(cached));
    } catch {}
  }, []);

  const login = useCallback(async () => {
    setLoading(true);
    try {
      await loadGoogleScript();
      const google = (window as any).google;
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid profile email",
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) { setLoading(false); return; }
          try {
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const u: GoogleUser = await res.json();
            setUser(u);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
          } catch (e) { console.error(e); }
          finally { setLoading(false); }
        },
      });
      client.requestAccessToken();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { user, loading, login, logout };
}

export { GOOGLE_CLIENT_ID };
