import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function PerformanceChart({ trades, isLoading }) {
  const generateChartData = () => {
    if (!trades || trades.length === 0) return [];
    
    const sortedTrades = [...trades]
      .filter(t => t.pnl !== undefined && t.entry_date)
      .sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));
    
    let cumulativePnL = 0;
    return sortedTrades.map(trade => {
      cumulativePnL += trade.pnl || 0;
      return {
        date: format(new Date(trade.entry_date), "MMM dd"),
        pnl: cumulativePnL,
        symbol: trade.symbol,
        strategy: trade.strategy
      };
    });
  };

  const chartData = generateChartData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
          <p className="text-gray-300 text-sm">{`Date: ${label}`}</p>
          <p className="text-green-400 font-bold">
            {`P&L: $${payload[0].value.toFixed(2)}`}
          </p>
          {data.symbol && (
            <p className="text-blue-400 text-sm">{`${data.symbol} - ${data.strategy}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Cumulative P&L Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                fontFamily="monospace"
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                fontFamily="monospace"
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="pnl" 
                stroke="#00BFFF" 
                strokeWidth={3}
                dot={{ fill: '#00BFFF', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#00BFFF', strokeWidth: 2, fill: '#0A0F1F' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}