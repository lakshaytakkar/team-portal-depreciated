import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Check, ChevronRight, ChevronLeft, Upload, Building2, FileText, CreditCard, Star,
  Shield, Globe, ArrowRight, PartyPopper, Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FORMATION_PACKAGES, US_STATES_POPULAR } from "@/lib/mock-data-dashboard-ln";

const STEPS = [
  { id: 1, title: "Package", icon: CreditCard },
  { id: 2, title: "KYC Documents", icon: FileText },
  { id: 3, title: "Entity Details", icon: Building2 },
  { id: 4, title: "Review & Submit", icon: Check },
];

export default function LnOnboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState("standard");
  const [entityType, setEntityType] = useState("llc");
  const [formationState, setFormationState] = useState("DE");
  const [companyName, setCompanyName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canProceed = () => {
    if (currentStep === 1) return !!selectedPackage;
    if (currentStep === 2) return true;
    if (currentStep === 3) return !!companyName && !!entityType && !!formationState;
    if (currentStep === 4) return agreedToTerms;
    return false;
  };

  if (submitted) {
    return (
      <div className="px-16 lg:px-24 py-16 max-w-2xl mx-auto" data-testid="ln-onboarding-success">
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center gap-6">
            <div className="size-20 rounded-full bg-green-100 flex items-center justify-center">
              <PartyPopper className="w-10 h-10 text-green-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold" data-testid="text-success-title">
                Formation Submitted!
              </h1>
              <p className="text-muted-foreground text-sm max-w-md">
                Your <strong>{companyName || "company"} {entityType.toUpperCase()}</strong> formation in{" "}
                <strong>{US_STATES_POPULAR.find(s => s.code === formationState)?.name || formationState}</strong>{" "}
                has been submitted. A dedicated specialist will be assigned within 24 hours.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="p-3 rounded-lg bg-blue-50 text-center">
                <p className="text-xs text-muted-foreground">Package</p>
                <p className="text-sm font-bold text-blue-700">{FORMATION_PACKAGES.find(p => p.id === selectedPackage)?.name}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-center">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-bold text-green-700">Processing</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => setLocation("/portal-ln")}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-start-formation-tracking"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Start Formation Tracking
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/portal-ln/companies")}
                data-testid="button-view-companies"
              >
                <Building2 className="w-4 h-4 mr-2" />
                View My Companies
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-16 lg:px-24 py-8 max-w-5xl mx-auto space-y-8" data-testid="ln-onboarding-page">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-onboarding-title">
          Start Your US Company Formation
        </h1>
        <p className="text-muted-foreground text-sm">
          Complete these steps to begin your LLC or Corporation formation in the United States
        </p>
      </div>

      <div className="flex items-center justify-center gap-2" data-testid="onboarding-stepper">
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const StepIcon = step.icon;
          return (
            <div key={step.id} className="flex items-center gap-2">
              <button
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                  isActive && "bg-blue-600 text-white shadow-md",
                  isCompleted && "bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200",
                  !isActive && !isCompleted && "bg-gray-100 text-gray-400"
                )}
                disabled={!isCompleted && !isActive}
                data-testid={`onboarding-step-${step.id}`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-300" />
              )}
            </div>
          );
        })}
      </div>

      {currentStep === 1 && (
        <div className="space-y-6" data-testid="step-package-selection">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Choose Your Formation Package</h2>
            <p className="text-sm text-muted-foreground mt-1">All packages include state filing fees and registered agent</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FORMATION_PACKAGES.map((pkg) => {
              const isSelected = selectedPackage === pkg.id;
              return (
                <Card
                  key={pkg.id}
                  className={cn(
                    "relative cursor-pointer transition-all hover:shadow-md",
                    isSelected && "ring-2 ring-blue-500 shadow-lg",
                    pkg.popular && "border-blue-200"
                  )}
                  onClick={() => setSelectedPackage(pkg.id)}
                  data-testid={`package-card-${pkg.id}`}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px]">
                      <Star className="w-3 h-3 mr-1" /> Most Popular
                    </Badge>
                  )}
                  <CardHeader className="pb-3 pt-5">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">${pkg.price}</span>
                      <span className="text-sm text-muted-foreground">USD</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {pkg.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                    {isSelected && (
                      <div className="pt-3">
                        <Badge className="bg-blue-600 text-white" data-testid={`badge-selected-${pkg.id}`}>Selected</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <Card data-testid="step-kyc-documents">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              KYC & Document Upload
            </CardTitle>
            <CardDescription>Upload identity documents for compliance verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { label: "Passport (Color Scan)", desc: "Front page with photo & details", required: true },
              { label: "Address Proof", desc: "Utility bill or bank statement (< 3 months old)", required: true },
              { label: "Selfie with Passport", desc: "Hold passport next to your face", required: true },
              { label: "SSN / ITIN (Optional)", desc: "Social Security Number or Individual Taxpayer ID, if available", required: false },
            ].map((doc, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-dashed border-gray-300 hover:border-blue-300 transition-colors" data-testid={`kyc-doc-row-${i}`}>
                <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{doc.label}</span>
                    {doc.required && <Badge variant="secondary" className="text-[9px] py-0">Required</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{doc.desc}</p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0" data-testid={`button-upload-doc-${i}`}>
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Upload
                </Button>
              </div>
            ))}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 text-blue-800 text-xs">
              <Globe className="w-4 h-4 shrink-0 mt-0.5" />
              <span>All documents are encrypted end-to-end and stored in compliance with US AML/KYC regulations. We never share your data with third parties.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card data-testid="step-entity-details">
          <CardHeader>
            <CardTitle>State & Entity Details</CardTitle>
            <CardDescription>Tell us about the company you want to form</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="e.g. TechVentures"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                data-testid="input-company-name"
              />
              <p className="text-xs text-muted-foreground">We'll check name availability with the state</p>
            </div>

            <div className="space-y-2">
              <Label>Entity Type</Label>
              <RadioGroup value={entityType} onValueChange={setEntityType} className="grid grid-cols-3 gap-3">
                {[
                  { value: "llc", label: "LLC", desc: "Limited Liability Company" },
                  { value: "corp", label: "C-Corp", desc: "C Corporation" },
                  { value: "scorp", label: "S-Corp", desc: "S Corporation" },
                ].map((t) => (
                  <Label
                    key={t.value}
                    htmlFor={`entity-${t.value}`}
                    data-testid={`entity-type-${t.value}`}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border-2 p-4 cursor-pointer transition-all",
                      entityType === t.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <RadioGroupItem value={t.value} id={`entity-${t.value}`} className="sr-only" />
                    <span className="font-semibold text-sm">{t.label}</span>
                    <span className="text-[11px] text-muted-foreground text-center">{t.desc}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>State of Formation</Label>
              <Select value={formationState} onValueChange={setFormationState}>
                <SelectTrigger data-testid="select-formation-state">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES_POPULAR.map((s) => (
                    <SelectItem key={s.code} value={s.code} data-testid={`state-option-${s.code}`}>
                      <div className="flex items-center gap-2">
                        <span>{s.name}</span>
                        {s.tag && <Badge variant="secondary" className="text-[9px] py-0">{s.tag}</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formationState && (
                <p className="text-xs text-muted-foreground">
                  {US_STATES_POPULAR.find((s) => s.code === formationState)?.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessPurpose">Business Purpose</Label>
              <Input
                id="businessPurpose"
                placeholder="e.g. E-commerce, SaaS, Consulting, Import/Export"
                data-testid="input-business-purpose"
              />
              <p className="text-xs text-muted-foreground">Briefly describe the primary activity of your company</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner / Organizer Full Name</Label>
                <Input id="ownerName" placeholder="Full legal name" data-testid="input-owner-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Email</Label>
                <Input id="ownerEmail" type="email" placeholder="you@example.com" data-testid="input-owner-email" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card data-testid="step-review">
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
            <CardDescription>Confirm your formation details before submission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Package</p>
                <p className="text-sm font-bold" data-testid="text-review-package">{FORMATION_PACKAGES.find(p => p.id === selectedPackage)?.name}</p>
                <p className="text-lg font-bold text-blue-600">${FORMATION_PACKAGES.find(p => p.id === selectedPackage)?.price} USD</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entity</p>
                <p className="text-sm font-bold" data-testid="text-review-entity">{companyName || "—"} {entityType.toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">State: {US_STATES_POPULAR.find(s => s.code === formationState)?.name || formationState}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">What Happens Next</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Payment processed securely via Stripe</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Dedicated specialist assigned within 24 hours</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> KYC documents reviewed by compliance team</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Formation filed with Secretary of State</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(v) => setAgreedToTerms(v === true)}
                data-testid="checkbox-agree-terms"
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I agree to the <span className="text-blue-600 underline">Terms of Service</span> and{" "}
                <span className="text-blue-600 underline">Privacy Policy</span>. I understand that formation timelines
                are estimates and may vary by state.
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          data-testid="button-onboarding-back"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-onboarding-next"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={() => setSubmitted(true)}
            disabled={!agreedToTerms}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-onboarding-submit"
          >
            <CreditCard className="w-4 h-4 mr-1" />
            Submit & Pay
          </Button>
        )}
      </div>
    </div>
  );
}
