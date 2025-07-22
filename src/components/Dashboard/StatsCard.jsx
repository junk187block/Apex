import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ title, value, icon: Icon, trend, bgGradient, glowColor }) {
  const getTrendIcon = () => {
    if (trend === "positive") return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === "negative") return <TrendingDown className="w-4 h-4 text-red-400" />;
    return null;
  };

  const getGlowClass = () => {
    switch (glowColor) {
      case "blue": return "hover:shadow-[0_0_20px_rgba(0,191,255,0.3)]";
      case "green": return "hover:shadow-[0_0_20px_rgba(57,255,20,0.3)]";
      case "purple": return "hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]";
      case "orange": return "hover:shadow-[0_0_20px_rgba(251,146,60,0.3)]";
      default: return "";
    }
  };

  return (
    <Card className={`bg-gray-900/50 border-gray-700 backdrop-blur-sm transition-all duration-300 ${getGlowClass()}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${bgGradient} opacity-80`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl md:text-3xl font-bold text-white font-mono">
            {value}
          </span>
          {getTrendIcon()}
        </div>
      </CardContent>
    </Card>
  );
}