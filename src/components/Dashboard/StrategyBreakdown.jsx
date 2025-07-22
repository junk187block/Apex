import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart3 } from "lucide-react";

const COLORS = ['#00BFFF', '#39FF14', '#D4AF37', '#FF4444', '#A855F7', '#F59E0B', '#EC4899', '#10B981'];

export default function StrategyBreakdown({ trades, isLoading }) {
  const getStrategyData = () => {
    if (!trades || trades.length === 0) return [];
    
    const strategyCounts = {};
    trades.forEach(trade => {
      strategyCounts[trade.strategy] = (strategyCounts[trade.strategy] || 0) + 1;
    });
    
    return Object.entries(strategyCounts).map(([strategy, count]) => ({
      name: strategy,
      value: count,
      percentage: ((count / trades.length) * 100).toFixed(1)
    }));
  };

  const strategyData = getStrategyData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-blue-400">{`Trades: ${data.value}`}</p>
          <p className="text-green-400">{`${data.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Strategy Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {strategyData.length > 0 ? (
          <>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={strategyData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {strategyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {strategyData.map((strategy, index) => (
                <div key={strategy.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-300 text-sm">{strategy.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{strategy.value}</div>
                    <div className="text-gray-400 text-xs">{strategy.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-500">
            No strategy data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}