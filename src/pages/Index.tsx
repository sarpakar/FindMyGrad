import { useState } from "react";
import { Hero } from "@/components/Hero";
import { ProgramCard } from "@/components/ProgramCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setPrograms([]);

    try {
      const { data, error } = await supabase.functions.invoke('search-programs', {
        body: { query }
      });

      if (error) {
        console.error('Error searching programs:', error);
        toast({
          title: "Search failed",
          description: error.message || "Failed to search for programs. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.programs && data.programs.length > 0) {
        setPrograms(data.programs);
        toast({
          title: "Search complete",
          description: `Found ${data.programs.length} programs matching your criteria.`,
        });
      } else {
        toast({
          title: "No results",
          description: "No programs found. Try a different search.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Hero onSearch={handleSearch} isLoading={isLoading} />
      
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Searching for the best programs...</p>
          </div>
        </div>
      )}

      {programs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
