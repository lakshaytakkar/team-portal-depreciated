import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageShell } from "@/components/layout";
import { PageTransition } from "@/components/ui/animated";
import { StyleGuideContent } from "./style-guide";
import { ComponentsGuideContent } from "./components-guide";
import { IconsGuideContent } from "./icons-guide";
import { LibraryContent } from "./library";

export default function DesignSystem() {
  return (
    <PageShell data-testid="page-design-system">
      <PageTransition>
        <Tabs defaultValue="style-guide" data-testid="tabs-design-system">
          <TabsList data-testid="tabs-list-design-system">
            <TabsTrigger value="style-guide" data-testid="tab-style-guide">Style Guide</TabsTrigger>
            <TabsTrigger value="components" data-testid="tab-ds-components">Components</TabsTrigger>
            <TabsTrigger value="icons" data-testid="tab-icons">Icons</TabsTrigger>
            <TabsTrigger value="library" data-testid="tab-library">Library</TabsTrigger>
          </TabsList>
          <div className="mt-8">
            <TabsContent value="style-guide">
              <StyleGuideContent />
            </TabsContent>
            <TabsContent value="components">
              <ComponentsGuideContent />
            </TabsContent>
            <TabsContent value="icons">
              <IconsGuideContent />
            </TabsContent>
            <TabsContent value="library">
              <LibraryContent />
            </TabsContent>
          </div>
        </Tabs>
      </PageTransition>
    </PageShell>
  );
}
