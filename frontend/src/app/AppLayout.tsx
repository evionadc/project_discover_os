import type { ReactNode } from "react";
import "./app-layout.css";

function TopBar({
  userName,
  workspaceName,
  onProfile,
  onWorkspace,
  onQuit,
  onLeanInception,
  activeNav,
}: {
  userName: string;
  workspaceName: string;
  onProfile: () => void;
  onWorkspace: () => void;
  onQuit: () => void;
  onLeanInception: () => void;
  activeNav: string;
}) {
  const sectionLabel: Record<string, string> = {
    inception: "Lean Inception",
    product_edit: "Editar produto",
    problems: "Problemas",
    okrs: "OKRs",
    journeys: "Jornadas",
    personas: "Personas",
    features: "Funcionalidades",
    stories: "Histórias",
    board: "Quadro",
    profile: "Perfil",
    workspace: "Workspace",
  };

  return (
    <header className="app-topbar">
      <div className="app-topbar__title">
        <strong>Product OS</strong>
        <span className="app-topbar__sep">/</span>
        <span>{workspaceName}</span>
        <span className="app-topbar__sep">/</span>
        <span className="app-topbar__active">{sectionLabel[activeNav] ?? "Problemas"}</span>
      </div>

      <div className="app-topbar__actions">
        <button onClick={onLeanInception} className="btn btn--ghost" type="button">
          Lean Inception
        </button>
        <button onClick={onWorkspace} className="btn btn--ghost" type="button">
          Workspace: <strong>{workspaceName}</strong>
        </button>
        <button onClick={onProfile} className="btn btn--ghost" type="button">
          {userName}
        </button>
        <button onClick={onQuit} className="btn btn--danger" type="button">
          Sair
        </button>
      </div>
    </header>
  );
}

function SideNav({
  activeNav,
  onNavigate,
  productName,
}: {
  activeNav: string;
  onNavigate: (next: string, anchor?: string) => void;
  productName: string;
}) {
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__brand">
        <div className="app-sidebar__avatar">PO</div>
        <div className="app-sidebar__product">
          <div className="app-sidebar__name">{productName || "Selecione um produto"}</div>
          <div className="app-sidebar__sub">Discovery + Delivery</div>
        </div>
      </div>
      <button
        type="button"
        className={`app-sidebar__item ${activeNav === "product_edit" ? "is-active" : ""}`}
        onClick={() => onNavigate("product_edit")}
      >
        Editar produto
      </button>

      <NavSection title="Descoberta">
        <NavItem active={activeNav === "problems"} onClick={() => onNavigate("problems")}>
          Problemas
        </NavItem>
        <NavItem active={activeNav === "personas"} onClick={() => onNavigate("personas")}>
          Personas
        </NavItem>
        <NavItem active={activeNav === "okrs"} onClick={() => onNavigate("okrs")}>
          OKRs
        </NavItem>
        <NavItem active={activeNav === "journeys"} onClick={() => onNavigate("journeys")}>
          Jornadas
        </NavItem>
      </NavSection>

      <NavSection title="Entrega">
        <NavItem active={activeNav === "features"} onClick={() => onNavigate("features")}>
          Funcionalidades
        </NavItem>
        <NavItem active={activeNav === "stories"} onClick={() => onNavigate("stories")}>
          Histórias
        </NavItem>
        <NavItem active={activeNav === "board"} onClick={() => onNavigate("board")}>
          Quadro
        </NavItem>
      </NavSection>
    </aside>
  );
}

function NavSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="app-sidebar__section">
      <div className="app-sidebar__section-title">{title}</div>
      <ul className="app-sidebar__list">{children}</ul>
    </div>
  );
}

function NavItem({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className={`app-sidebar__item ${active ? "is-active" : ""}`}
        onClick={onClick}
      >
        {children}
      </button>
    </li>
  );
}

interface LayoutProps {
  children: ReactNode;
  activeNav: string;
  onNavigate: (next: string, anchor?: string) => void;
  onProfile: () => void;
  onWorkspace: () => void;
  onQuit: () => void;
  onLeanInception: () => void;
  userName: string;
  workspaceName: string;
  productName: string;
}

export default function AppLayout({
  children,
  activeNav,
  onNavigate,
  onProfile,
  onWorkspace,
  onQuit,
  onLeanInception,
  userName,
  workspaceName,
  productName,
}: LayoutProps) {
  return (
    <div className="app-shell">
      <TopBar
        userName={userName}
        workspaceName={workspaceName}
        onProfile={onProfile}
        onWorkspace={onWorkspace}
        onQuit={onQuit}
        onLeanInception={onLeanInception}
        activeNav={activeNav}
      />

      <div className="app-shell__body">
        <SideNav activeNav={activeNav} onNavigate={onNavigate} productName={productName} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
