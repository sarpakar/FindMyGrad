import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface HeroProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export const Hero = ({ onSearch, isLoading }: HeroProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground">
            Find Your Grad
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Discover the perfect master's or PhD program powered by AI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex gap-2 shadow-elegant p-2 bg-card rounded-lg">
            <Input
              type="text"
              placeholder="e.g., I want to study AI in sports analytics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 focus-visible:ring-0 text-lg"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !query.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Search className="mr-2 h-5 w-5" />
              Search
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 justify-center">
          {["AI in Sports", "Neuroscience PhD", "Machine Learning Europe", "Climate Research"].map((example) => (
            <Button
              key={example}
              variant="outline"
              size="sm"
              onClick={() => setQuery(example)}
              disabled={isLoading}
              className="text-sm"
            >
              {example}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
