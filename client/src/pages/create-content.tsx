import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bot, Bold, Italic, Link as LinkIcon, Image, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PlatformSelector from "../components/content/platform-selector";
import AiSuggestions from "../components/content/ai-suggestions";

export default function CreateContent() {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["Instagram", "Facebook"]);
  const [scheduleOption, setScheduleOption] = useState("now");
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return apiRequest("POST", "/api/posts", postData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your post has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      // Reset form
      setContent("");
      setSelectedPlatforms(["Instagram", "Facebook"]);
      setScheduleOption("now");
      setShowAiSuggestions(false);
      setAiSuggestions([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateAiSuggestionsMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/ai/suggestions", { prompt });
      return response.json();
    },
    onSuccess: (data) => {
      setAiSuggestions(data.suggestions);
      setShowAiSuggestions(true);
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your post.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform.",
        variant: "destructive",
      });
      return;
    }

    const status = scheduleOption === "approval" ? "pending" : 
                  scheduleOption === "later" ? "scheduled" : "published";

    createPostMutation.mutate({
      content,
      platforms: selectedPlatforms,
      status,
      aiGenerated: showAiSuggestions && aiSuggestions.includes(content),
      scheduledFor: scheduleOption === "later" ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
    });
  };

  const handleAiAssist = () => {
    if (!content.trim()) {
      generateAiSuggestionsMutation.mutate("Generate social media content for a coffee shop");
    } else {
      generateAiSuggestionsMutation.mutate(content);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setContent(suggestion);
    setShowAiSuggestions(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Create New Content</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Use AI assistance to create engaging social media posts
                </p>
              </div>
              <Button onClick={handleAiAssist} disabled={generateAiSuggestionsMutation.isPending}>
                <Bot className="w-4 h-4 mr-2" />
                {generateAiSuggestionsMutation.isPending ? "Generating..." : "AI Assist"}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Platform Selection */}
            <PlatformSelector 
              selectedPlatforms={selectedPlatforms}
              onPlatformsChange={setSelectedPlatforms}
            />
            
            {/* Content Input */}
            <div>
              <Label className="text-base font-medium">Content</Label>
              <div className="mt-3 border border-border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b border-border flex items-center space-x-2 text-sm">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Image className="w-4 h-4" />
                  </Button>
                  <div className="ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAiAssist}
                      disabled={generateAiSuggestionsMutation.isPending}
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      AI Suggest
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="border-0 resize-none h-32 focus-visible:ring-0"
                  placeholder="What would you like to share? Describe your business update, promotion, or let AI help you create content..."
                />
              </div>
            </div>
            
            {/* AI Suggestions */}
            {showAiSuggestions && (
              <AiSuggestions
                suggestions={aiSuggestions}
                onSelectSuggestion={handleSelectSuggestion}
              />
            )}
            
            {/* Platform Preview */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Preview Across Platforms</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPlatforms.slice(0, 2).map((platform) => (
                  <Card key={platform}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <i className={`fab fa-${platform.toLowerCase().replace(' (twitter)', '').replace('x (twitter)', 'twitter')} ${
                          platform === "Instagram" ? "text-pink-500" :
                          platform === "Facebook" ? "text-blue-600" :
                          platform.includes("Twitter") ? "text-blue-400" :
                          platform === "TikTok" ? "text-gray-800" :
                          platform === "LinkedIn" ? "text-blue-700" : ""
                        }`} />
                        <span className="text-sm font-medium">{platform}</span>
                      </div>
                      <div className="bg-muted p-3 rounded text-sm text-muted-foreground">
                        {content || "Preview of your content optimized for " + platform + "..."}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Schedule Options */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <RadioGroup
                  value={scheduleOption}
                  onValueChange={setScheduleOption}
                  className="flex items-center space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="now" id="now" />
                    <Label htmlFor="now" className="text-sm">Publish Now</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="later" id="later" />
                    <Label htmlFor="later" className="text-sm">Schedule for Later</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="approval" id="approval" />
                    <Label htmlFor="approval" className="text-sm">Send for Approval</Label>
                  </div>
                </RadioGroup>
                <Button 
                  onClick={handleSubmit}
                  disabled={createPostMutation.isPending}
                  className="px-6"
                >
                  {createPostMutation.isPending ? "Creating..." : "Create Post"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
