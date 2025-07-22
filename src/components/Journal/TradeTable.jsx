
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Circle, ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import TradeActions from "./TradeActions";

const strategyColors = {
  "R:R": "bg-blue-900/30 text-blue-400 border-blue-500/30",
  "DCA T.A": "bg-purple-900/30 text-purple-400 border-purple-500/30",
  "TSL": "bg-green-900/30 text-green-400 border-green-500/30",
  "Scalp": "bg-red-900/30 text-red-400 border-red-500/30",
  "R:R Swing": "bg-cyan-900/30 text-cyan-400 border-cyan-500/30",
  "TSL Scalp": "bg-yellow-900/30 text-yellow-400 border-yellow-500/30",
  "DCA Scalp": "bg-pink-900/30 text-pink-400 border-pink-500/30",
  "Breakout": "bg-orange-900/30 text-orange-400 border-orange-500/30",
  "Reversal": "bg-indigo-900/30 text-indigo-400 border-indigo-500/30"
};

const riskColors = {
  "Very Low": "bg-green-900/30 text-green-400 border-green-500/30",
  "Low": "bg-blue-900/30 text-blue-400 border-blue-500/30",
  "Medium": "bg-yellow-900/30 text-yellow-400 border-yellow-500/30",
  "High": "bg-orange-900/30 text-orange-400 border-orange-500/30",
  "Very High": "bg-red-900/30 text-red-400 border-red-500/30"
};

const trendColors = {
  "Bull": "bg-green-900/30 text-green-400",
  "Bear": "bg-red-900/30 text-red-400",
  "Break": "bg-blue-900/30 text-blue-400",
  "Side": "bg-gray-900/30 text-gray-400",
  "Reversal": "bg-purple-900/30 text-purple-400"
};

export default function TradeTable({ trades, isLoading, onTradeUpdated }) {
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

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700">
            {['Symbol', 'Strategy', 'Entry', 'Quantity', 'Risk', 'P&L', 'Status', 'R:R', 'Actions'].map((header) => (
              <TableHead key={header} className="text-gray-400 font-semibold">{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(8).fill(0).map((_, i) => (
            <TableRow key={i} className="border-gray-700">
              <TableCell><Skeleton className="h-4 w-16 bg-gray-700" /></TableCell>
              <TableCell><Skeleton className="h-6 w-20 bg-gray-700" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20 bg-gray-700" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 bg-gray-700" /></TableCell>
              <TableCell><Skeleton className="h-6 w-16 bg-gray-700" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20 bg-gray-700" /></TableCell>
              <TableCell><Skeleton className="h-6 w-16 bg-gray-700" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12 bg-gray-700" /></TableCell>
              <TableCell><Skeleton className="h-6 w-16 bg-gray-700" /></TableCell> {/* Skeleton for Actions */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No trades found</div>
        <div className="text-gray-400 text-sm">Try adjusting your search or filters</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700">
            <TableHead className="text-gray-400 font-semibold">Symbol</TableHead>
            <TableHead className="text-gray-400 font-semibold">Strategy</TableHead>
            <TableHead className="text-gray-400 font-semibold">Entry</TableHead>
            <TableHead className="text-gray-400 font-semibold">Quantity</TableHead>
            <TableHead className="text-gray-400 font-semibold">Risk</TableHead>
            <TableHead className="text-gray-400 font-semibold">Trend</TableHead>
            <TableHead className="text-gray-400 font-semibold">P&L</TableHead>
            <TableHead className="text-gray-400 font-semibold">Status</TableHead>
            <TableHead className="text-gray-400 font-semibold">R:R</TableHead>
            <TableHead className="text-gray-400 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => {
            const riskReward = trade.take_profit && trade.stop_loss && trade.price ? 
              (Math.abs(trade.take_profit - trade.price) / Math.abs(trade.price - trade.stop_loss)).toFixed(2) : 
              null;

            return (
              <TableRow key={trade.id} className="border-gray-700 hover:bg-gray-800/30 transition-colors">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-bold text-white font-mono text-lg">
                      {trade.symbol}
                    </div>
                    <div className="text-xs text-gray-400">
                      {format(new Date(trade.entry_date), "MMM d, HH:mm")}
                    </div>
                    {trade.dca_group_id && (
                      <Badge variant="outline" className="text-xs bg-purple-900/20 text-purple-400 border-purple-500/30">
                        {trade.dca_group_id}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={strategyColors[trade.strategy] || "bg-gray-700 text-gray-300"}>
                    {trade.strategy}
                  </Badge>
                  <div className="text-xs text-gray-400 mt-1">{trade.interval}</div>
                </TableCell>
                <TableCell>
                  <div className="font-mono text-white font-semibold">
                    ${formatPrice(trade.price)}
                  </div>
                  <div className="text-xs text-gray-400">
                    Capital: {formatCurrency(trade.capital)}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-gray-300">
                  {trade.quantity.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={riskColors[trade.risk]}>
                    {trade.risk}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={trendColors[trade.trend]}>
                    {trade.trend}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className={`font-bold font-mono text-lg ${
                      (trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(trade.pnl || 0) >= 0 ? '+' : ''}{formatCurrency(trade.pnl || 0)}
                    </div>
                    {trade.percentage !== undefined && (
                      <div className={`text-sm ${
                        trade.percentage >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {trade.percentage > 0 ? '+' : ''}{trade.percentage.toFixed(2)}%
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Circle className={`w-2 h-2 ${
                      trade.status === 'Open' ? 'text-blue-400 fill-current' : 'text-gray-500 fill-current'
                    }`} />
                    <span className={`text-sm font-medium ${
                      trade.status === 'Open' ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      {trade.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {trade.result}
                  </div>
                </TableCell>
                <TableCell>
                  {riskReward ? (
                    <Badge 
                      variant="outline" 
                      className={`font-mono ${
                        parseFloat(riskReward) >= 2 ? 'text-green-400 border-green-500/30' : 
                        parseFloat(riskReward) >= 1 ? 'text-yellow-400 border-yellow-500/30' : 
                        'text-red-400 border-red-500/30'
                      }`}
                    >
                      1:{riskReward}
                    </Badge>
                  ) : (
                    <span className="text-gray-500 text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <TradeActions trade={trade} onTradeUpdated={onTradeUpdated} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
