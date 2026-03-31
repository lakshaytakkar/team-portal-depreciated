import { useState } from "react";
import { Check, ChevronsUpDown, Building2, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { verticals } from "@/lib/verticals-config";
import { useVertical } from "@/lib/vertical-store";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LegalNationsLogo } from "@/components/brand/legalnations-logo";
import { EazyToSellLogo } from "@/components/brand/eazytosell-logo";
import { Separator } from "@/components/ui/separator";
import etsLogoLargeUrl from "@assets/eazytosell-logo-transparent.png";

const businessProducts = verticals.filter((v) => !v.isDepartment && !v.isPortal);
const departments = verticals.filter((v) => v.isDepartment);
const vendorPortals = verticals.filter((v) => v.isPortal && v.id !== "ets-portal");

export function VerticalSwitcher() {
  const { currentVertical, setCurrentVertical } = useVertical();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const handleSwitch = (verticalId: string) => {
    const target = verticals.find((v) => v.id === verticalId);
    if (target) {
      setCurrentVertical(verticalId);
      setLocation(target.navCategories[0].defaultUrl);
    }
    setOpen(false);
  };

  const CurrentLogo = currentVertical.logo;
  const isEtsPortal = currentVertical.id === "ets-portal" || currentVertical.id === "ets";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2.5 shrink-0 rounded-md px-1.5 py-1 transition-colors hover:bg-accent outline-none"
          data-testid="vertical-switcher"
        >
          {isEtsPortal ? (
            <img
              src={etsLogoLargeUrl}
              alt="EazyToSell"
              className="h-[76px] w-auto object-contain -my-2"
              loading="eager"
              data-testid="img-ets-logo-large"
            />
          ) : (
            <>
              <CurrentLogo size={36} />
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-base font-bold font-heading tracking-tight leading-tight">
                  {currentVertical.shortName}
                </span>
                <span className="text-[11px] text-muted-foreground leading-none">
                  {currentVertical.tagline}
                </span>
              </div>
            </>
          )}
          <ChevronsUpDown className="size-3.5 text-muted-foreground hidden sm:block" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="p-0 w-auto shadow-xl border border-border rounded-xl overflow-hidden"
        data-testid="vertical-switcher-menu"
      >
        <div className="flex">
          <div className="w-60 p-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 pt-1.5 pb-2">
              Business Products
            </p>
            <div className="space-y-0.5">
              {businessProducts.map((v) => {
                const isActive = currentVertical.id === v.id;
                const LogoComponent = v.logo;
                return (
                  <button
                    key={v.id}
                    onClick={() => handleSwitch(v.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors hover:bg-accent",
                      isActive && "bg-accent"
                    )}
                    data-testid={`vertical-option-${v.id}`}
                  >
                    <LogoComponent size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">{v.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{v.tagline}</p>
                    </div>
                    {isActive && <Check className="size-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-60 bg-muted/40 border-l border-border p-2">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 pt-1.5 pb-2">
              <Building2 className="size-3" />
              Departments
            </p>
            <div className="space-y-0.5">
              {departments.map((v) => {
                const isActive = currentVertical.id === v.id;
                const LogoComponent = v.logo;
                return (
                  <button
                    key={v.id}
                    onClick={() => handleSwitch(v.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors hover:bg-accent",
                      isActive && "bg-accent"
                    )}
                    data-testid={`vertical-option-${v.id}`}
                  >
                    <LogoComponent size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">{v.shortName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{v.tagline}</p>
                    </div>
                    {isActive && <Check className="size-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-56 bg-muted/20 border-l border-border p-2">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 pt-1.5 pb-2">
              <ExternalLink className="size-3" />
              Client Portals
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => { setLocation("/portal/legalnations"); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors hover:bg-accent"
                data-testid="portal-option-legalnations"
              >
                <LegalNationsLogo size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate leading-tight">LegalNations</p>
                  <p className="text-[11px] text-muted-foreground truncate">Client Portal</p>
                </div>
                <ExternalLink className="size-3 text-muted-foreground shrink-0" />
              </button>
              <button
                onClick={() => { setLocation("/portal-ets"); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors hover:bg-accent"
                data-testid="portal-option-ets"
              >
                <EazyToSellLogo size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate leading-tight">EazyToSell</p>
                  <p className="text-[11px] text-muted-foreground truncate">Franchise Portal</p>
                </div>
                <ExternalLink className="size-3 text-muted-foreground shrink-0" />
              </button>
            </div>

            {vendorPortals.length > 0 && (
              <>
                <Separator className="my-2" />

                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 pt-1 pb-2">
                  <ExternalLink className="size-3" />
                  Vendor Portals
                </p>
                <div className="space-y-0.5">
                  {vendorPortals.map((v) => {
                    const isActive = currentVertical.id === v.id;
                    const LogoComponent = v.logo;
                    return (
                      <button
                        key={v.id}
                        onClick={() => handleSwitch(v.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors hover:bg-accent",
                          isActive && "bg-accent"
                        )}
                        data-testid={`portal-option-${v.id}`}
                      >
                        <LogoComponent size={32} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">{v.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{v.tagline}</p>
                        </div>
                        {isActive ? <Check className="size-3.5 text-primary shrink-0" /> : <ExternalLink className="size-3 text-muted-foreground shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="mt-2 mx-2 pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Preview portals as your customers and vendors see them.
              </p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
