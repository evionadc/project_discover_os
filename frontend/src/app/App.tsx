import { useState } from "react";
import AppLayout from "./AppLayout";
import ProblemsPage from "../modules/discovery/pages/ProblemsPage";
import PersonasPage from "../modules/discovery/pages/PersonaPage";
import HypothesesPage from "../modules/discovery/pages/HypothesesPage";
import MvpsPage from "../modules/discovery/pages/MvpsPage";
import LoginPage from "../modules/auth/pages/LoginPage";
import RegisterPage from "../modules/auth/pages/RegisterPage";
import ProfilePage from "../modules/auth/pages/ProfilePage";
import WorkspacePage from "../modules/workspaces/pages/WorkspacePage";
import FeaturesPage from "../modules/delivery/pages/FeaturesPage";
import StoriesPage from "../modules/delivery/pages/StoriesPage";
import { useWorkspace } from "../modules/shared/hooks/useWorkspace";

export default function App() {
  const [activeNav, setActiveNav] = useState("problems");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const workspace = useWorkspace();

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
  if (activeNav === "hypotheses") page = <HypothesesPage />;
  if (activeNav === "mvps") page = <MvpsPage />;
  if (activeNav === "features") page = <FeaturesPage />;
  if (activeNav === "stories") page = <StoriesPage />;
  if (activeNav === "profile") page = <ProfilePage />;
  if (activeNav === "workspace") page = <WorkspacePage />;

  return (
    <AppLayout
      activeNav={activeNav}
      onNavigate={handleNavigate}
      onProfile={handleProfile}
      onWorkspace={handleWorkspace}
      onQuit={handleQuit}
      userName="PM"
      workspaceName={workspace.name}
    >
      {page}
    </AppLayout>
  );
}
