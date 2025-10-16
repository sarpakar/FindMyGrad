import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, GraduationCap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProgramCardProps {
  program: {
    id: string;
    name: string;
    university: string;
    country?: string;
    degree_type?: string;
    description?: string;
    research_areas?: string[];
    tags?: string[];
    ranking?: number;
  };
}

export const ProgramCard = ({ program }: ProgramCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-border bg-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{program.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              {program.university}
            </CardDescription>
          </div>
          {program.ranking && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-accent text-accent" />
              {program.ranking}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {program.country && (
            <>
              <MapPin className="h-4 w-4" />
              {program.country}
            </>
          )}
          {program.degree_type && (
            <Badge variant="outline" className="ml-auto">
              {program.degree_type}
            </Badge>
          )}
        </div>

        {program.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {program.description}
          </p>
        )}

        {program.research_areas && program.research_areas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {program.research_areas.slice(0, 3).map((area, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
        )}

        {program.tags && program.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {program.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} className="text-xs bg-accent">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Button
          className="w-full"
          onClick={() => navigate(`/program/${program.id}`)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};
