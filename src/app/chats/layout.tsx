
import SideBar from "@/components/SideBar";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <SideBar />
      {children}
    </div>
  );
}