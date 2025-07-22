
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Target } from "lucide-react";
import { format } from "date-fns";
import TradeTable from "./TradeTable";

export default function DCAGroupView({ groupId, trades, onTradeUpdated }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const calculateGroupStats = () => {
    const totalCapital = trades.reduce((sum, trade) => sum + trade.capital, 0);
    const totalQuantity = trades.reduce((sum, trade) => sum + trade.quantity, 0);
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const avgEntryPrice = trades.reduce((sum, trade) => sum + (trade.price * trade.quantity), 0) / totalQuantity;
    const openTrades = trades.filter(t => t.status === 'Open').length;
    const closedTrades = trades.filter(t => t.status === 'Closed').length;
    
    const overallPercentage = totalCapital > 0 ? (totalPnL / totalCapital) * 100 : 0;
    const firstEntry = trades.sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date))[0];
    
    return {
      totalCapital,
      totalQuantity,
      totalPnL,
      avgEntryPrice,
      overallPercentage,
      openTrades,
      closedTrades,
      symbol: firstEntry?.symbol || 'N/A',
      strategy: firstEntry?.strategy || 'N/A',
      firstEntryDate: firstEntry?.entry_date
    };
  };

  const stats = calculateGroupStats();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-800/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isExpanded ? 
                <ChevronUp className="w-5 h-5 text-blue-400" /> : 
                <ChevronDown className="w-5 h-5 text-blue-400" />
              }
              <CardTitle className="text-white font-mono">
                {groupId}
              </CardTitle>
            </div>
            <Badge 
              variant="outline" 
              className="bg-purple-900/30 text-purple-400 border-purple-500/30"
            >
              {stats.strategy}
            </Badge>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-400">Symbol</div>
              <div className="font-bold text-white font-mono text-lg">{stats.symbol}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Avg Entry</div>
              <div className="font-mono text-white">${formatPrice(stats.avgEntryPrice)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Total Capital</div>
              <div className="font-bold text-white">{formatCurrency(stats.totalCapital)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Net P&L</div>
              <div className={`font-bold text-lg ${
                stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.totalPnL >= 0 ? '+' : ''}{formatCurrency(stats.totalPnL)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Return %</div>
              <div className={`font-bold flex items-center gap-1 ${
                stats.overallPercentage >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.overallPercentage >= 0 ? 
                  <TrendingUp className="w-4 h-4" /> : 
                  <TrendingDown className="w-4 h-4" />
                }
                {stats.overallPercentage > 0 ? '+' : ''}{stats.overallPercentage.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Summary Stats Row */}
        <div className="flex items-center gap-6 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-sm">Total Entries: {trades.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-400 text-sm">Open: {stats.openTrades}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-gray-400 text-sm">Closed: {stats.closedTrades}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Quantity: {stats.totalQuantity.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">
              Started: {stats.firstEntryDate && format(new Date(stats.firstEntryDate), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <TradeTable trades={trades} isLoading={false} onTradeUpdated={onTradeUpdated} />
        </CardContent>
      )}
    </Card>
  );
}
