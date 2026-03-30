import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, BookOpen, HelpCircle, Save } from "lucide-react";
import { mockKnowledgeBase } from "@/lib/mock-data";

export default function ManageServices() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [services, setServices] = useState(mockKnowledgeBase);

  // Mock form state
  const [newService, setNewService] = useState({
    title: "",
    category: "",
    content: "",
    faqs: [{ q: "", a: "" }]
  });

  const addFaq = () => {
    setNewService({
      ...newService,
      faqs: [...newService.faqs, { q: "", a: "" }]
    });
  };

  const updateFaq = (index: number, field: 'q' | 'a', value: string) => {
    const updatedFaqs = [...newService.faqs];
    updatedFaqs[index][field] = value;
    setNewService({ ...newService, faqs: updatedFaqs });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this service entry?")) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">
            Update service details, add FAQs, and maintain internal documentation.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]">
              <Plus className="mr-2 h-4 w-4" /> Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Service Knowledge</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Service Title</Label>
                  <Input 
                    placeholder="e.g. Website Development" 
                    value={newService.title}
                    onChange={e => setNewService({...newService, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input 
                    placeholder="e.g. Development Services" 
                    value={newService.category}
                    onChange={e => setNewService({...newService, category: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description / Content</Label>
                <Textarea 
                  className="min-h-[100px]" 
                  placeholder="Detailed description of the service..."
                  value={newService.content}
                  onChange={e => setNewService({...newService, content: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Frequently Asked Questions</Label>
                  <Button variant="outline" size="sm" onClick={addFaq}>
                    <Plus className="h-3 w-3 mr-1" /> Add FAQ
                  </Button>
                </div>
                {newService.faqs.map((faq, index) => (
                  <div key={index} className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border/50">
                    <Input 
                      placeholder="Question" 
                      value={faq.q}
                      onChange={e => updateFaq(index, 'q', e.target.value)}
                    />
                    <Textarea 
                      placeholder="Answer" 
                      value={faq.a}
                      onChange={e => updateFaq(index, 'a', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsDialogOpen(false)} className="bg-[#2563EB] hover:bg-[#1D4ED8]">
                  <Save className="mr-2 h-4 w-4" /> Save Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {services.map((item) => (
          <Card key={item.id} className="overflow-hidden group">
            <CardHeader className="bg-muted/30 pb-4 flex flex-row items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {item.title}
                </CardTitle>
                <CardDescription>{item.category}</CardDescription>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="text-sm text-foreground/80 leading-relaxed">
                {item.content}
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  FAQs
                </h4>
                <Accordion type="single" collapsible className="w-full">
                  {item.faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger className="text-sm py-2">{faq.q}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}