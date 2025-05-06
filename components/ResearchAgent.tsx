// components/ResearchAgent.tsx
"use client";

import { useState } from "react";
import { Search, Globe, FileText, Github, ArrowRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResearchPlan, ResearchStep, ProcessedSearchResult, ResearchArtifact } from "@/lib/types";

export default function ResearchAgent() {
  // State management
  const [query, setQuery] = useState<string>("");
  const [isResearching, setIsResearching] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [researchPlan, setResearchPlan] = useState<ResearchPlan | null>(null);
  const [artifacts, setArtifacts] = useState<ResearchArtifact[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("plan");
  const [error, setError] = useState<string>("");

  // Start research
  const startResearch = async () => {
    if (!query.trim()) return;
    
    setIsResearching(true);
    setResearchPlan(null);
    setArtifacts([]);
    setSummary("");
    setError("");
    
    try {
      const response = await fetch('/api/research/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start research');
      }
      
      const data = await response.json();
      setSessionId(data.sessionId);
      setResearchPlan(data.plan);
      setActiveTab('plan');
      
      // Begin executing the research plan
      await executeResearchPlan(data.sessionId);
    } catch (error) {
      setError('Failed to start research: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsResearching(false);
    }
  };

  // Execute research plan
  const executeResearchPlan = async (sid: string) => {
    const currentId = sid || sessionId;
    if (!currentId) return;
    
    try {
      // Initial wait to give time for UI update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      while (true) {
        const response = await fetch('/api/research/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: currentId })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.isComplete) {
            // Research is complete
            setIsResearching(false);
            break;
          }
          throw new Error('Failed to execute step');
        }
        
        const data = await response.json();
        
        // Update the research plan
        setResearchPlan(prev => {
          if (!prev) return null;
          
          const updatedSteps = prev.steps.map(step => 
            step.id === data.stepId 
              ? { ...step, status: 'completed' } 
              : step
          );
          
          return { ...prev, steps: updatedSteps };
        });
        
        // Update artifacts
        if (data.result) {
          const stepInfo = researchPlan?.steps.find(s => s.id === data.stepId);
          if (stepInfo) {
            setArtifacts(prev => [
              ...prev, 
              {
                taskId: data.stepId,
                taskType: stepInfo.action.type,
                artifact: data.result
              }
            ]);
            
            // If this is a summary step, update the summary state
            if (stepInfo.action.type === 'summarize') {
              setSummary(data.result);
              setActiveTab('summary');
            }
          }
        }
        
        // If plan is complete, break the loop
        if (data.isComplete) {
          setIsResearching(false);
          break;
        }
        
        // Wait a bit before the next step
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      setError('Error during research: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsResearching(false);
    }
  };

  // Dig deeper for more research
  const digDeeper = async () => {
    if (!sessionId || isResearching || !researchPlan) return;
    
    setIsResearching(true);
    setError('');
    
    try {
      // Create additional steps using GPT-4
      const response = await fetch('/api/research/dig-deeper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to dig deeper');
      }
      
      const data = await response.json();
      
      // Add new steps to the research plan
      setResearchPlan(prev => {
        if (!prev) return null;
        return {
          ...prev,
          steps: [...prev.steps, ...data.additionalSteps]
        };
      });
      
      // Execute the new steps
      await executeResearchPlan(sessionId);
    } catch (error) {
      setError('Failed to dig deeper: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsResearching(false);
    }
  };

  // Render the UI
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-foreground mb-6" style={{ fontFamily: "cursive" }}>
            Research Agent
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel - Input and tools */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What would you like to research today?</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Enter your research question or topic..." 
                  className="min-h-[120px]"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isResearching}
                />
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={startResearch}
                  disabled={isResearching || !query.trim()}
                >
                  {isResearching ? 'Researching...' : 'Start Research'}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Available Tools</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors">
                  <Search className="h-5 w-5" />
                  <span>Search Web</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors">
                  <Globe className="h-5 w-5" />
                  <span>Visit Web Page</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors">
                  <FileText className="h-5 w-5" />
                  <span>Visit Scientific Paper</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors">
                  <Github className="h-5 w-5" />
                  <span>Visit GitHub Repo</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dig Deeper</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={digDeeper}
                  disabled={!sessionId || isResearching || artifacts.length === 0}
                >
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Explore Further
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right panel - Results and workflow */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <ArrowRight className="h-5 w-5 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Planning Agent</p>
                    <p className="text-sm text-muted-foreground">
                      A first agent creates a research plan with specific steps to follow
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="h-5 w-5 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Evaluation Agent</p>
                    <p className="text-sm text-muted-foreground">
                      A secondary agent judges if the search results are good enough
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="h-5 w-5 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Dig Deeper</p>
                    <p className="text-sm text-muted-foreground">Explore topics in greater depth when needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Research Results</CardTitle>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="plan">Research Plan</TabsTrigger>
                    <TabsTrigger value="results">Results</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                  </TabsList>
                  
                  {/* Research Plan Tab */}
                  <TabsContent value="plan" className="mt-4 space-y-4">
                    {researchPlan ? (
                      researchPlan.steps.map((step) => (
                        <div 
                          key={step.id} 
                          className={`p-4 border rounded-md ${
                            step.status === 'completed' ? 'bg-green-50 border-green-200' :
                            step.status === 'in-progress' ? 'bg-blue-50 border-blue-200' :
                            step.status === 'failed' ? 'bg-red-50 border-red-200' :
                            'bg-muted/50'
                          }`}
                        >
                          <h3 className="font-medium mb-2">Step {step.id}: {step.description}</h3>
                          <p className="text-sm text-muted-foreground">
                            Tool: {step.action.type.replace('_', ' ')}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Enter a research query to generate a plan
                      </p>
                    )}
                  </TabsContent>
                  
                  {/* Results Tab */}
                  <TabsContent value="results" className="mt-4">
                    {artifacts.length > 0 ? (
                      <div className="space-y-4">
                        {artifacts.map((artifact, index) => (
                          <div key={index} className="p-4 border rounded-md">
                            <h3 className="font-medium mb-2">
                              {artifact.taskType === 'search' ? 'Search Results' : 
                               artifact.taskType === 'summarize' ? 'Summary' :
                               artifact.taskType}
                            </h3>
                            
                            {artifact.taskType === 'search' && (
                              <div className="space-y-3 mt-3">
                                {(artifact.artifact as ProcessedSearchResult[]).map((result, idx) => (
                                  <div key={idx} className="border-b pb-3 last:border-b-0">
                                    <a href={result.url} target="_blank" rel="noopener noreferrer" 
                                       className="font-medium hover:underline text-blue-600">
                                      {result.title}
                                    </a>
                                    <p className="text-sm text-muted-foreground">{result.source} • {result.date}</p>
                                    <p className="mt-1">{result.summary}</p>
                                    {result.keyPoints.length > 0 && (
                                      <ul className="mt-1 text-sm">
                                        {result.keyPoints.map((point, i) => (
                                          <li key={i} className="mt-1">• {point}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {artifact.taskType === 'summarize' && (
                              <p className="mt-2">{artifact.artifact as string}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Results will appear as research progresses
                      </p>
                    )}
                  </TabsContent>
                  
                  {/* Summary Tab */}
                  <TabsContent value="summary" className="mt-4">
                    {summary ? (
                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-2">Research Summary</h3>
                        <p>{summary}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Summary will appear after research is complete
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}