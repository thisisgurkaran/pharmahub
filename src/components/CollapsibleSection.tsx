import { ReactNode } from "react";
import Card from "@mui/material/Card";
import Collapse from "@mui/material/Collapse";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleSectionProps {
  id: string;
  title: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary";
  className?: string;
  leftBorder?: boolean;
  actions?: ReactNode;
}

const CollapsibleSection = ({
  id,
  title,
  isExpanded,
  onToggle,
  children,
  variant = "primary",
  className = "",
  leftBorder = false,
  actions,
}: CollapsibleSectionProps) => {
  const getHeaderStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: "hsl(174, 62%, 47%)",
          color: "white",
        };
      case "secondary":
        return {
          backgroundColor: "hsl(174, 62%, 40%)",
          color: "white",
        };
      case "tertiary":
        return {
          backgroundColor: "hsl(174, 50%, 92%)",
          color: "hsl(0, 0%, 15%)",
        };
      default:
        return {
          backgroundColor: "hsl(174, 62%, 47%)",
          color: "white",
        };
    }
  };

  const headerStyles = getHeaderStyles();
  const IconComponent = isExpanded ? ChevronUp : ChevronDown;

  return (
    <Card
      sx={{
        borderLeft: leftBorder ? "4px solid hsl(174, 62%, 47%)" : undefined,
        mb: 1,
        overflow: "hidden",
      }}
      className={className}
    >
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        style={headerStyles}
        onClick={() => onToggle(id)}
      >
        <div className="flex items-center gap-2 flex-1">
          <h3
            className={`font-semibold ${
              variant === "primary" ? "text-lg" : "text-sm"
            }`}
            style={{ color: headerStyles.color }}
          >
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <IconComponent
            className={`${variant === "primary" ? "w-5 h-5" : "w-4 h-4"}`}
            style={{ color: headerStyles.color }}
          />
        </div>
      </div>
      <Collapse in={isExpanded}>
        <div className="bg-background">{children}</div>
      </Collapse>
    </Card>
  );
};

export default CollapsibleSection;
