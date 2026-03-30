import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, PlayCircle, Video, FileText, Upload } from "lucide-react";
import { mockTrainingModules } from "@/lib/mock-data";

export default function ManageTraining() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modules, setModules] = useState(mockTrainingModules);

  // Mock form state
  const [newModule, setNewModule] = useState({
    title: "",
    type: "video",
    duration: "",
    url: ""
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this training module?")) {
      setModules(modules.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Training LMS</h1>
          <p className="text-muted-foreground mt-1">
            Upload videos, documents, and manage training curriculum.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]">
              <Plus className="mr-2 h-4 w-4" /> Add Module
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Training Module</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Module Title</Label>
                <Input 
                  placeholder="e.g. Advanced Sales Closing Techniques" 
                  value={newModule.title}
                  onChange={e => setNewModule({...newModule, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    defaultValue="video" 
                    onValueChange={v => setNewModule({...newModule, type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Lesson</SelectItem>
                      <SelectItem value="document">Document / PDF</SelectItem>
                      <SelectItem value="quiz">Quiz / Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input 
                    placeholder="e.g. 15 min" 
                    value={newModule.duration}
                    onChange={e => setNewModule({...newModule, duration: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Content Source</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload or drag & drop</span>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsDialogOpen(false)} className="bg-[#2563EB] hover:bg-[#1D4ED8]">
                  Upload & Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.id} className="group overflow-hidden relative">
            <div className="relative aspect-video bg-muted">
              <img 
                src={module.thumbnail} 
                alt={module.title}
                className="object-cover w-full h-full opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                {module.type === 'video' ? (
                  <PlayCircle className="h-12 w-12 text-white opacity-90" />
                ) : (
                  <FileText className="h-12 w-12 text-white opacity-90" />
                )}
              </div>
              <Badge className="absolute bottom-2 right-2 bg-black/60 border-none text-white backdrop-blur-sm">
                {module.duration}
              </Badge>
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="secondary" size="sm">
                   <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(module.id)}>
                   <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-base line-clamp-1">{module.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span className="capitalize">{module.type}</span> • Beginner
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}