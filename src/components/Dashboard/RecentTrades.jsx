import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight, Circle } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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
  "Very Low": "bg-green-900/30 text-green-400",
  "Low": "bg-blue-900/30 text-blue-400",
  "Medium": "bg-yellow-900/30 text-yellow-400",
  "High": "bg-orange-900/30 text-orange-400",
  "Very High": "bg-red-900/30 text-red-400"
};

export default function RecentTrades({ trades, isLoading }) {
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
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-blue-400" />
          Recent Trades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-400 font-semibold">Symbol</TableHead>
                <TableHead className="text-gray-400 font-semibold">Strategy</TableHead>
                <TableHead className="text-gray-400 font-semibold">Entry</TableHead>
                <TableHead className="text-gray-400 font-semibold">Qty</TableHead>
                <TableHead className="text-gray-400 font-semibold">Risk</TableHead>
                <TableHead className="text-gray-400 font-semibold">P&L</TableHead>
                <TableHead className="text-gray-400 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-gray-700">
                    <TableCell><Skeleton className="h-4 w-16 bg-gray-700" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 bg-gray-700" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 bg-gray-700" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 bg-gray-700" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 bg-gray-700" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 bg-gray-700" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 bg-gray-700" /></TableCell>
                  </TableRow>
                ))
              ) : (
                trades.map((trade) => (
                  <TableRow key={trade.id} className="border-gray-700 hover:bg-gray-800/30 transition-colors">
                    <TableCell>
                      <div className="font-bold text-white font-mono">
                        {trade.symbol}
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(new Date(trade.entry_date), "MMM d")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={strategyColors[trade.strategy] || "bg-gray-700 text-gray-300"}>
                        {trade.strategy}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-white">
                      ${formatPrice(trade.price)}
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
                      <div className={`font-bold font-mono ${
                        (trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(trade.pnl || 0)}
                      </div>
                      {trade.percentage && (
                        <div className={`text-xs ${
                          trade.percentage >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {trade.percentage > 0 ? '+' : ''}{trade.percentage.toFixed(2)}%
                        </div>
                      )}
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}