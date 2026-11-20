import { TaHeader } from "@/components/TaHeader";

export default function TaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TaHeader />
      <main className="page" id="main">
        {children}
      </main>
    </>
  );
}
