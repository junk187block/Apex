import React, { useState, useEffect } from "react";
import { Trade } from "@/entities/Trade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, BarChart3 } from "lucide-react";

import StatsCard from "../components/dashboard/StatsCard";
import RecentTrades from "../components/dashboard/RecentTrades";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import StrategyBreakdown from "../components/dashboard/StrategyBreakdown";

export default function Dashboard() {
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPnL: 0,
    winRate: 0,
    totalTrades: 0,
    openPositions: 0,
    bestTrade: 0,
    worstTrade: 0,
    avgWin: 0,
    avgLoss: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const tradesData = await Trade.list('-entry_date');
      setTrades(tradesData);
      calculateStats(tradesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (tradesData) => {
    const totalTrades = tradesData.length;
    const openPositions = tradesData.filter(t => t.status === 'Open').length;
    const closedTrades = tradesData.filter(t => t.status === 'Closed');
    const wins = closedTrades.filter(t => t.result === 'Win');
    const losses = closedTrades.filter(t => t.result === 'Loss');
    
    const totalPnL = tradesData.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
    
    const winAmounts = wins.map(t => t.pnl || 0);
    const lossAmounts = losses.map(t => t.pnl || 0);
    
    const bestTrade = winAmounts.length > 0 ? Math.max(...winAmounts) : 0;
    const worstTrade = lossAmounts.length > 0 ? Math.min(...lossAmounts) : 0;
    const avgWin = winAmounts.length > 0 ? winAmounts.reduce((a, b) => a + b, 0) / winAmounts.length : 0;
    const avgLoss = lossAmounts.length > 0 ? lossAmounts.reduce((a, b) => a + b, 0) / lossAmounts.length : 0;

    setStats({
      totalPnL,
      winRate,
      totalTrades,
      openPositions,
      bestTrade,
      worstTrade,
      avgWin,
      avgLoss
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value) => `${value.toFixed(1)}%`;

  return (
    <div className="min-h-screen p-6" style={{background: 'linear-gradient(135deg, #0A0F1F 0%, #141B30 100%)'}}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Trading Dashboard
            </h1>
            <p className="text-gray-400 mt-2 font-mono">Real-time portfolio performance & analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className="bg-green-900/30 text-green-400 border-green-500/30 font-mono"
            >
              LIVE MARKET
            </Badge>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Net P&L"
            value={formatCurrency(stats.totalPnL)}
            icon={DollarSign}
            trend={stats.totalPnL >= 0 ? "positive" : "negative"}
            bgGradient="from-blue-600 to-cyan-500"
            glowColor="blue"
          />
          <StatsCard
            title="Win Rate"
            value={formatPercentage(stats.winRate)}
            icon={Target}
            trend="neutral"
            bgGradient="from-green-600 to-emerald-500"
            glowColor="green"
          />
          <StatsCard
            title="Total Trades"
            value={stats.totalTrades.toString()}
            icon={Activity}
            trend="neutral"
            bgGradient="from-purple-600 to-pink-500"
            glowColor="purple"
          />
          <StatsCard
            title="Open Positions"
            value={stats.openPositions.toString()}
            icon={BarChart3}
            trend="neutral"
            bgGradient="from-orange-600 to-yellow-500"
            glowColor="orange"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Best Trade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold text-green-400">
                  {formatCurrency(stats.bestTrade)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Worst Trade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <span className="text-2xl font-bold text-red-400">
                  {formatCurrency(stats.worstTrade)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Avg Win
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-green-400">
                {formatCurrency(stats.avgWin)}
              </span>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Avg Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-red-400">
                {formatCurrency(stats.avgLoss)}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart trades={trades} isLoading={isLoading} />
          </div>
          <div>
            <StrategyBreakdown trades={trades} isLoading={isLoading} />
          </div>
        </div>

        {/* Recent Trades */}
        <RecentTrades trades={trades.slice(0, 10)} isLoading={isLoading} />
      </div>
    </div>
  );
}