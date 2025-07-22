import React, { useState, useEffect } from "react";
import { Trade } from "@/entities/Trade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Target, BarChart3, Award, AlertTriangle } from "lucide-react";

export default function Analytics() {
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const tradesData = await Trade.list('-entry_date');
      setTrades(tradesData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredTrades = () => {
    if (timeFilter === 'all') return trades;
    
    const now = new Date();
    let filterDate;
    
    switch (timeFilter) {
      case '7d':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        filterDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return trades;
    }
    
    return trades.filter(trade => new Date(trade.entry_date) >= filterDate);
  };

  const calculateAdvancedMetrics = () => {
    const filteredTrades = getFilteredTrades();
    const closedTrades = filteredTrades.filter(t => t.status === 'Closed');
    const wins = closedTrades.filter(t => t.result === 'Win');
    const losses = closedTrades.filter(t => t.result === 'Loss');
    
    const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
    const totalPnL = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalCapital = filteredTrades.reduce((sum, trade) => sum + trade.capital, 0);
    const roi = totalCapital > 0 ? (totalPnL / totalCapital) * 100 : 0;
    
    const winAmounts = wins.map(t => t.pnl || 0);
    const lossAmounts = losses.map(t => t.pnl || 0);
    
    const avgWin = winAmounts.length > 0 ? winAmounts.reduce((a, b) => a + b, 0) / winAmounts.length : 0;
    const avgLoss = lossAmounts.length > 0 ? lossAmounts.reduce((a, b) => a + b, 0) / lossAmounts.length : 0;
    
    const profitFactor = (avgLoss < 0 && avgWin > 0) ? Math.abs(avgWin / avgLoss) : 0;
    
    // Calculate consecutive wins/losses
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;
    
    closedTrades.forEach(trade => {
      if (trade.result === 'Win') {
        currentWins++;
        currentLosses = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins);
      } else if (trade.result === 'Loss') {
        currentLosses++;
        currentWins = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses);
      }
    });

    return {
      totalTrades: filteredTrades.length,
      closedTrades: closedTrades.length,
      winRate,
      totalPnL,
      roi,
      avgWin,
      avgLoss,
      profitFactor,
      maxConsecutiveWins,
      maxConsecutiveLosses,
      bestTrade: Math.max(...filteredTrades.map(t => t.pnl || 0), 0),
      worstTrade: Math.min(...filteredTrades.map(t => t.pnl || 0), 0)
    };
  };

  const getStrategyPerformance = () => {
    const filteredTrades = getFilteredTrades();
    const strategyStats = {};
    
    filteredTrades.forEach(trade => {
      if (!strategyStats[trade.strategy]) {
        strategyStats[trade.strategy] = {
          name: trade.strategy,
          trades: 0,
          pnl: 0,
          wins: 0,
          losses: 0
        };
      }
      
      strategyStats[trade.strategy].trades++;
      strategyStats[trade.strategy].pnl += trade.pnl || 0;
      
      if (trade.result === 'Win') strategyStats[trade.strategy].wins++;
      if (trade.result === 'Loss') strategyStats[trade.strategy].losses++;
    });
    
    return Object.values(strategyStats).map(strategy => ({
      ...strategy,
      winRate: strategy.trades > 0 ? ((strategy.wins / (strategy.wins + strategy.losses)) * 100) : 0
    }));
  };

  const getRiskAnalysis = () => {
    const filteredTrades = getFilteredTrades();
    const riskStats = {};
    
    filteredTrades.forEach(trade => {
      if (!riskStats[trade.risk]) {
        riskStats[trade.risk] = {
          name: trade.risk,
          count: 0,
          pnl: 0
        };
      }
      
      riskStats[trade.risk].count++;
      riskStats[trade.risk].pnl += trade.pnl || 0;
    });
    
    return Object.values(riskStats);
  };

  const metrics = calculateAdvancedMetrics();
  const strategyPerformance = getStrategyPerformance();
  const riskAnalysis = getRiskAnalysis();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const COLORS = ['#00BFFF', '#39FF14', '#D4AF37', '#FF4444', '#A855F7', '#F59E0B', '#EC4899', '#10B981'];

  return (
    <div className="min-h-screen p-6" style={{background: 'linear-gradient(135deg, #0A0F1F 0%, #141B30 100%)'}}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Trading Analytics</h1>
              <p className="text-gray-400 font-mono">Advanced performance insights & metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(0,191,255,0.3)] transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white font-mono">
                {metrics.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {metrics.closedTrades} closed trades
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Profit Factor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white font-mono">
                {metrics.profitFactor.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Avg Win / Avg Loss
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                ROI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold font-mono ${metrics.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.roi > 0 ? '+' : ''}{metrics.roi.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Total Return
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(255,68,68,0.3)] transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Max Drawdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400 font-mono">
                {formatCurrency(metrics.worstTrade)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Worst Single Trade
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Best Trade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400 font-mono">
                {formatCurrency(metrics.bestTrade)}
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
              <div className="text-2xl font-bold text-green-400 font-mono">
                {formatCurrency(metrics.avgWin)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Avg Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400 font-mono">
                {formatCurrency(metrics.avgLoss)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Max Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-lg font-bold text-green-400">
                  {metrics.maxConsecutiveWins} wins
                </div>
                <div className="text-lg font-bold text-red-400">
                  {metrics.maxConsecutiveLosses} losses
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strategy Performance */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Strategy Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strategyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                      formatter={(value, name) => [
                        name === 'pnl' ? formatCurrency(value) : `${value.toFixed(1)}%`,
                        name === 'pnl' ? 'P&L' : 'Win Rate'
                      ]}
                    />
                    <Bar dataKey="pnl" fill="#00BFFF" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskAnalysis}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {riskAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}