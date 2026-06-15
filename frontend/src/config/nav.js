import { LayoutDashboard, Clock, NotebookPen, Sparkles, Brain } from "lucide-react";

export const NAV_ITEMS = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    subtitle: "Your relationship intelligence overview",
  },
  {
    to: "/timeline",
    label: "Timeline",
    icon: Clock,
    title: "Memory Timeline",
    subtitle: "Explore full interaction history for any contact",
  },
  {
    to: "/add",
    label: "Add Meeting",
    icon: NotebookPen,
    title: "Add Meeting",
    subtitle: "Build relationship memory, one note at a time",
  },
  {
    to: "/insights",
    label: "Insights",
    icon: Sparkles,
    title: "Ask Insights",
    subtitle: "Natural language questions about any contact",
  },
  {
    to: "/brief",
    label: "Brief",
    icon: Brain,
    title: "Meeting Brief",
    subtitle: "AI-powered prep from recalled memories",
  },
];
