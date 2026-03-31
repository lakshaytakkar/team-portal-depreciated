import { Search, BookOpen, HelpCircle, MessageCircle, Zap } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { helpCenterArticles } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Skeleton } from "@/components/ui/skeleton";
import { Fade, PageTransition } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";

const categoryIcons: Record<string, typeof BookOpen> = {
  "Getting Started": Zap,
  "Products & Research": BookOpen,
  "Billing & Plans": MessageCircle,
  "Technical Support": HelpCircle,
};

export default function HelpCenterPage() {
  const loading = useSimulatedLoading();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = helpCenterArticles
    .map((cat) => ({
      ...cat,
      articles: cat.articles.filter(
        (a) =>
          !searchQuery ||
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.content.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.articles.length > 0);

  return (
    <PageShell>
      <PageTransition>
        {loading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-10 w-full max-w-md mx-auto" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-background p-5">
                <Skeleton className="h-5 w-1/4 mb-4" />
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="mx-auto w-full max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-help-search"
                />
              </div>
            </div>

            <Fade direction="up" delay={0.1}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                {helpCenterArticles.map((cat) => {
                  const Icon = categoryIcons[cat.category] || HelpCircle;
                  return (
                    <Card key={cat.category} className="p-4 hover-elevate" data-testid={`card-category-${cat.category.toLowerCase().replace(/\s+/g, "-")}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold">{cat.category}</h3>
                          <p className="text-xs text-muted-foreground">{cat.articles.length} articles</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Fade>

            <Fade direction="up" delay={0.2}>
              <div className="flex flex-col gap-6">
                {filteredCategories.map((cat) => {
                  const Icon = categoryIcons[cat.category] || HelpCircle;
                  return (
                    <div
                      key={cat.category}
                      className="rounded-lg border bg-background"
                      data-testid={`section-${cat.category.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div className="flex items-center gap-3 border-b px-5 py-4">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </div>
                        <h2 className="text-base font-semibold font-heading">{cat.category}</h2>
                      </div>
                      <div className="px-5">
                        <Accordion type="single" collapsible>
                          {cat.articles.map((article, idx) => (
                            <AccordionItem
                              key={idx}
                              value={`${cat.category}-${idx}`}
                              data-testid={`accordion-${cat.category.toLowerCase().replace(/\s+/g, "-")}-${idx}`}
                            >
                              <AccordionTrigger className="text-sm" data-testid={`trigger-${cat.category.toLowerCase().replace(/\s+/g, "-")}-${idx}`}>
                                {article.title}
                              </AccordionTrigger>
                              <AccordionContent>
                                <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`content-${cat.category.toLowerCase().replace(/\s+/g, "-")}-${idx}`}>
                                  {article.content}
                                </p>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Fade>

            {filteredCategories.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-12">
                <HelpCircle className="size-10 text-muted-foreground" />
                <p className="text-sm font-medium">No articles found</p>
                <p className="text-xs text-muted-foreground">Try adjusting your search query</p>
              </div>
            )}
          </div>
        )}
      </PageTransition>
    </PageShell>
  );
}
