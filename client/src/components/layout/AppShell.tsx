import { Dock } from "./Dock";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div className="flex h-screen w-full bg-background">
        <Dock />
        <div className="w-[210px] flex-shrink-0" style={{ marginLeft: '52px' }}>
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="px-6 py-6 space-y-6 animate-in fade-in duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center h-14 px-4 border-b">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[210px]">
              <Sidebar inSheet />
            </SheetContent>
          </Sheet>
          <span className="ml-4 text-[15px] font-semibold text-foreground tracking-tight">Suprans Portal</span>
        </div>

        <Header />

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="px-6 py-6 space-y-6 animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
