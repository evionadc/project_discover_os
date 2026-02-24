import { useEffect, useMemo, useState } from "react";
import AppLayout from "./AppLayout";
import ProblemsPage from "../modules/discovery/pages/ProblemsPage";
import PersonasPage from "../modules/discovery/pages/PersonaPage";
import OkrsPage from "../modules/discovery/pages/OkrsPage";
import UserJourneysPage from "../modules/discovery/pages/UserJourneysPage";
import LoginPage from "../modules/auth/pages/LoginPage";
import RegisterPage from "../modules/auth/pages/RegisterPage";
import ProfilePage from "../modules/auth/pages/ProfilePage";
import WorkspacePage from "../modules/workspaces/pages/WorkspacePage";
import WorkspaceOnboardingPage from "../modules/workspaces/pages/WorkspaceOnboardingPage";
import ProductEditPage from "../modules/workspaces/pages/ProductEditPage";
import FeaturesPage from "../modules/delivery/pages/FeaturesPage";
import StoriesPage from "../modules/delivery/pages/StoriesPage";
import BoardPage from "../modules/delivery/pages/BoardPage";
import InceptionWizardPage from "../modules/inceptions/pages/InceptionWizardPage";
import { useWorkspace } from "../modules/shared/hooks/useWorkspace";
import { login, register } from "../modules/auth/services/authApi";
import {
  createWorkspace,
  listWorkspaces,
  type WorkspaceSummary,
} from "../modules/workspaces/services/workspaceApi";

type AuthUser = {
  id: number;
  email: string;
};

const AUTH_STORAGE_KEY = "authSession";

function loadAuthSession(): { token: string; user: AuthUser } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      token?: string;
      user?: { id?: number; email?: string };
    };
    if (!parsed.token || !parsed.user?.id || !parsed.user?.email) return null;
    return { token: parsed.token, user: { id: parsed.user.id, email: parsed.user.email } };
  } catch {
    return null;
  }
}

export default function App() {
  const [activeNav, setActiveNav] = useState("problems");
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => loadAuthSession()?.user ?? null);
  const [authToken, setAuthToken] = useState<string | null>(() => loadAuthSession()?.token ?? null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem("selectedWorkspace");
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { id?: number };
      return typeof parsed.id === "number" ? parsed.id : null;
    } catch {
      return null;
    }
  });
  const [selectedProduct, setSelectedProduct] = useState<{ id: number | null; name: string }>(() => {
    if (typeof window === "undefined") return { id: null, name: "" };
    try {
      const raw = window.localStorage.getItem("selectedProduct");
      if (!raw) return { id: null, name: "" };
      const parsed = JSON.parse(raw) as { id: number | null; name: string };
      return { id: parsed.id ?? null, name: parsed.name ?? "" };
    } catch {
      return { id: null, name: "" };
    }
  });
  const workspace = useWorkspace();

  const isLoggedIn = Boolean(authUser && authToken);

  const selectedWorkspace = useMemo(
    () => workspaces.find((item) => item.id === selectedWorkspaceId) ?? null,
    [workspaces, selectedWorkspaceId]
  );

  const persistAuthSession = (token: string, user: AuthUser) => {
    setAuthToken(token);
    setAuthUser(user);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
  };

  const clearSession = () => {
    setAuthToken(null);
    setAuthUser(null);
    setWorkspaces([]);
    setSelectedWorkspaceId(null);
    setSelectedProduct({ id: null, name: "" });
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem("selectedWorkspace");
    window.localStorage.removeItem("selectedProduct");
  };

  const loadUserWorkspaces = async (userId: number) => {
    setWorkspaceLoading(true);
    setWorkspaceError(null);
    try {
      const data = await listWorkspaces(userId);
      setWorkspaces(data);

      if (data.length === 0) {
        setSelectedWorkspaceId(null);
        window.localStorage.removeItem("selectedWorkspace");
        return;
      }

      const nextSelected = data.some((w) => w.id === selectedWorkspaceId)
        ? selectedWorkspaceId
        : data[0].id;

      if (nextSelected) {
        const next = data.find((w) => w.id === nextSelected)!;
        setSelectedWorkspaceId(next.id);
        window.localStorage.setItem(
          "selectedWorkspace",
          JSON.stringify({ id: next.id, name: next.name })
        );
      }
    } catch (err) {
      setWorkspaceError(err instanceof Error ? err.message : "Erro ao carregar workspaces");
    } finally {
      setWorkspaceLoading(false);
    }
  };

  useEffect(() => {
    window.localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));
  }, [selectedProduct]);

  useEffect(() => {
    if (!authUser) return;
    loadUserWorkspaces(authUser.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: number; name: string }>;
      if (!customEvent.detail) return;
      setSelectedProduct({ id: customEvent.detail.id, name: customEvent.detail.name });
    };
    window.addEventListener("product:selected", handler as EventListener);
    return () => window.removeEventListener("product:selected", handler as EventListener);
  }, []);

  const handleNavigate = (next: string, anchor?: string) => {
    setActiveNav(next);
    if (!anchor) return;
    setTimeout(() => {
      const target = document.getElementById(anchor);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 0);
  };

  const handleProfile = () => handleNavigate("profile");
  const handleWorkspace = () => handleNavigate("workspace");
  const handleQuit = () => {
    clearSession();
    handleNavigate("login");
  };

  const handleLeanInception = () => {
    handleNavigate("inception");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isLoggedIn) {
    if (activeNav === "register") {
      return (
        <RegisterPage
          onRegister={async ({ email, password }) => {
            const auth = await register(email, password);
            persistAuthSession(auth.access_token, { id: auth.user_id, email: auth.email });
            setActiveNav("problems");
          }}
          onBackToLogin={() => handleNavigate("login")}
        />
      );
    }
    return (
      <LoginPage
        onLogin={async ({ email, password }) => {
          const auth = await login(email, password);
          persistAuthSession(auth.access_token, { id: auth.user_id, email: auth.email });
          handleNavigate("problems");
        }}
        onRegister={() => handleNavigate("register")}
      />
    );
  }

  if (workspaceLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p>Carregando workspace...</p>
      </div>
    );
  }

  if (workspaceError) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div className="card" style={{ padding: 16, maxWidth: 560 }}>
          <p style={{ color: "#b91c1c", marginTop: 0 }}>{workspaceError}</p>
          <button className="btn btn--primary" type="button" onClick={() => authUser && loadUserWorkspaces(authUser.id)}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!selectedWorkspace) {
    return (
      <WorkspaceOnboardingPage
        onCreateWorkspace={async (name) => {
          if (!authUser) return;
          const created = await createWorkspace({
            name,
            owner_id: authUser.id,
            member_ids: [authUser.id],
          });
          const updated = await listWorkspaces(authUser.id);
          setWorkspaces(updated);
          setSelectedWorkspaceId(created.id);
          window.localStorage.setItem(
            "selectedWorkspace",
            JSON.stringify({ id: created.id, name: created.name })
          );
          setActiveNav("workspace");
        }}
      />
    );
  }

  let page = <ProblemsPage />;
  if (activeNav === "personas") page = <PersonasPage />;
  if (activeNav === "okrs") page = <OkrsPage productId={selectedProduct.id} />;
  if (activeNav === "journeys") page = <UserJourneysPage />;
  if (activeNav === "inception") page = <InceptionWizardPage />;
  if (activeNav === "product_edit") {
    page = (
      <ProductEditPage
        productId={selectedProduct.id}
        onProductUpdated={(product) => setSelectedProduct(product)}
      />
    );
  }
  if (activeNav === "features") page = <FeaturesPage />;
  if (activeNav === "stories") page = <StoriesPage />;
  if (activeNav === "board") page = <BoardPage />;
  if (activeNav === "profile") page = <ProfilePage />;
  if (activeNav === "workspace") {
    page = (
      <WorkspacePage
        selectedProductId={selectedProduct.id}
        onSelectProduct={(product) => setSelectedProduct(product)}
      />
    );
  }

  return (
    <AppLayout
      activeNav={activeNav}
      onNavigate={handleNavigate}
      onProfile={handleProfile}
      onWorkspace={handleWorkspace}
      onQuit={handleQuit}
      onLeanInception={handleLeanInception}
      userName={authUser?.email ?? "Usuario"}
      workspaceName={workspace.name}
      productName={selectedProduct.name}
    >
      {page}
    </AppLayout>
  );
}

