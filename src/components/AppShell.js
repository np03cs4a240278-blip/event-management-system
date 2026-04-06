import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function AppShell({ title, subtitle, actions, children }) {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-shell__main">
        <Navbar actions={actions} subtitle={subtitle} title={title} />

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
