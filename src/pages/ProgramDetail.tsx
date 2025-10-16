import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, GraduationCap, Star, Users, Sparkles, Loader2, BookmarkPlus } from "lucide-react";

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [program, setProgram] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProgram();
    }
  }, [id]);

  const fetchProgram = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProgram(data);
    } catch (error) {
      console.error('Error fetching program:', error);
      toast({
        title: "Error",
        description: "Failed to load program details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async () => {
    if (!id) return;
    
    setIsGeneratingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { programId: id }
      });

      if (error) throw error;

      if (data?.program) {
        setProgram(data.program);
        toast({
          title: "Summary generated",
          description: "AI summary has been generated successfully.",
        });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Program not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Button>

        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-4">{program.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-5 w-5" />
                      <span className="text-lg">{program.university}</span>
                    </div>
                    {program.country && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-5 w-5" />
                        <span>{program.country}</span>
                      </div>
                    )}
                  </div>
                </div>
                {program.ranking && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-lg px-4 py-2">
                    <Star className="h-5 w-5 fill-accent text-accent" />
                    {program.ranking}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {program.degree_type && (
                <Badge className="text-sm px-3 py-1">
                  {program.degree_type}
                </Badge>
              )}

              {program.description && (
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">About the Program</h3>
                  <p className="text-muted-foreground">{program.description}</p>
                </div>
              )}

              {program.ai_summary && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI-Generated Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{program.ai_summary}</p>
                  </CardContent>
                </Card>
              )}

              {!program.ai_summary && (
                <Button
                  onClick={generateSummary}
                  disabled={isGeneratingSummary}
                  className="w-full"
                  variant="outline"
                >
                  {isGeneratingSummary ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating AI Summary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate AI Summary
                    </>
                  )}
                </Button>
              )}

              {program.research_areas && program.research_areas.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">Research Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {program.research_areas.map((area: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {program.professors && program.professors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <Users className="h-5 w-5" />
                    Notable Faculty
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {program.professors.map((prof: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {prof}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {program.tags && program.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {program.tags.map((tag: string, idx: number) => (
                      <Badge key={idx} className="bg-accent">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full" size="lg">
                <BookmarkPlus className="mr-2 h-5 w-5" />
                Save Program
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetail;
