import { useEffect, useState } from "react";
import AppLayout from "./AppLayout";
import ProblemsPage from "../modules/discovery/pages/ProblemsPage";
import PersonasPage from "../modules/discovery/pages/PersonaPage";
import OkrsPage from "../modules/discovery/pages/OkrsPage";
import UserJourneysPage from "../modules/discovery/pages/UserJourneysPage";
import LoginPage from "../modules/auth/pages/LoginPage";
import RegisterPage from "../modules/auth/pages/RegisterPage";
import ProfilePage from "../modules/auth/pages/ProfilePage";
import WorkspacePage from "../modules/workspaces/pages/WorkspacePage";
import ProductEditPage from "../modules/workspaces/pages/ProductEditPage";
import FeaturesPage from "../modules/delivery/pages/FeaturesPage";
import StoriesPage from "../modules/delivery/pages/StoriesPage";
import BoardPage from "../modules/delivery/pages/BoardPage";
import InceptionWizardPage from "../modules/inceptions/pages/InceptionWizardPage";
import { useWorkspace } from "../modules/shared/hooks/useWorkspace";

export default function App() {
  const [activeNav, setActiveNav] = useState("problems");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  useEffect(() => {
    window.localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));
  }, [selectedProduct]);

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
    setIsLoggedIn(false);
    handleNavigate("login");
  };

  const handleLeanInception = () => {
    handleNavigate("inception");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isLoggedIn) {
    if (activeNav === "register") {
      return <RegisterPage onBackToLogin={() => handleNavigate("login")} />;
    }
    return (
      <LoginPage
        onLogin={() => {
          setIsLoggedIn(true);
          handleNavigate("problems");
        }}
        onRegister={() => handleNavigate("register")}
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
      userName="PM"
      workspaceName={workspace.name}
      productName={selectedProduct.name}
    >
      {page}
    </AppLayout>
  );
}
