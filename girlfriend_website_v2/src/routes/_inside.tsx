import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_inside")({
  component: InsideLayout,
});

function InsideLayout() {
  const navigate = useNavigate();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("entered") !== "1") {
      navigate({ to: "/" });
    } else {
      setOk(true);
    }
  }, [navigate]);

  if (!ok) return <div className="min-h-screen bg-noir" />;

  return <Outlet />;
}
