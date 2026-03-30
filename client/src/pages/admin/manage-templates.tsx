import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Mail, MessageSquare, Phone, AlertCircle } from "lucide-react";
import { mockTemplates } from "@/lib/mock-data";

export default function ManageTemplates() {
  const [activeTab, setActiveTab] = useState("scripts");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Mock local state for the prototype since we don't have a real backend CRUD
  const [scripts, setScripts] = useState(mockTemplates.scripts);
  const [emails, setEmails] = useState(mockTemplates.emails);
  const [messages, setMessages] = useState(mockTemplates.messages);
  const [objections, setObjections] = useState(mockTemplates.objections);

  const handleDelete = (id: string, type: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      if (type === 'scripts') setScripts(scripts.filter(i => i.id !== id));
      if (type === 'emails') setEmails(emails.filter(i => i.id !== id));
      if (type === 'messages') setMessages(messages.filter(i => i.id !== id));
      if (type === 'objections') setObjections(objections.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Templates</h1>
          <p className="text-muted-foreground mt-1">
            Create and edit sales scripts, email templates, and objection handlers.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]">
              <Plus className="mr-2 h-4 w-4" /> Add New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select defaultValue={activeTab}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scripts">Sales Script</SelectItem>
                    <SelectItem value="emails">Email Template</SelectItem>
                    <SelectItem value="messages">Message/SMS</SelectItem>
                    <SelectItem value="objections">Objection Handler</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title / Scenario</Label>
                <Input placeholder="e.g. Introduction Call" />
              </div>
              {activeTab === 'emails' && (
                <div className="space-y-2">
                  <Label>Subject Line</Label>
                  <Input placeholder="e.g. Follow up on our conversation" />
                </div>
              )}
              <div className="space-y-2">
                <Label>Content / Response</Label>
                <Textarea className="min-h-[150px]" placeholder="Enter the template content..." />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsDialogOpen(false)} className="bg-[#2563EB] hover:bg-[#1D4ED8]">
                  Save Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="scripts">Scripts</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="objections">Objections</TabsTrigger>
        </TabsList>

        <TabsContent value="scripts" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scripts.map((script) => (
              <Card key={script.id} className="relative group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base pr-8">
                    <Phone className="h-4 w-4 text-blue-500" />
                    {script.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-md text-sm italic border border-border/50 line-clamp-4">
                    "{script.content}"
                  </div>
                  <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil className="h-3 w-3 mr-2" /> Edit
                    </Button>
                    <Button variant="outline" size="icon" className="shrink-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(script.id, 'scripts')}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="emails" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {emails.map((email) => (
              <Card key={email.id} className="relative group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base pr-8">
                    <Mail className="h-4 w-4 text-purple-500" />
                    {email.title}
                  </CardTitle>
                  <CardDescription>Subject: {email.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md text-sm border border-border/50 font-mono text-xs line-clamp-4">
                    {email.content}
                  </div>
                  <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil className="h-3 w-3 mr-2" /> Edit
                    </Button>
                    <Button variant="outline" size="icon" className="shrink-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(email.id, 'emails')}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {messages.map((msg) => (
              <Card key={msg.id} className="relative group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base pr-8">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    {msg.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-md text-sm border border-border/50 line-clamp-4">
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil className="h-3 w-3 mr-2" /> Edit
                    </Button>
                    <Button variant="outline" size="icon" className="shrink-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(msg.id, 'messages')}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="objections" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {objections.map((obj) => (
              <Card key={obj.id} className="border-l-4 border-l-orange-500 relative group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-orange-700 dark:text-orange-400 pr-8">
                    <AlertCircle className="h-4 w-4" />
                    Objection: "{obj.title}"
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">Suggested Response:</span>
                    <div className="text-sm line-clamp-3">
                      {obj.response}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil className="h-3 w-3 mr-2" /> Edit
                    </Button>
                    <Button variant="outline" size="icon" className="shrink-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(obj.id, 'objections')}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}