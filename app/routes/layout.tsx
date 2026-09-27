import { Outlet } from "react-router";
import Header from "~/partials/Header";
import Footer from "~/partials/Footer";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col mt-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
