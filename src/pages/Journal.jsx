
import React, { useState, useEffect } from "react";
import { Trade } from "@/entities/Trade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Filter, Plus, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import TradeTable from "../components/journal/TradeTable";
import FilterPanel from "../components/journal/FilterPanel";
import DCAGroupView from "../components/journal/DCAGroupView";

export default function Journal() {
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [groupByDCA, setGroupByDCA] = useState(false);
  const [filters, setFilters] = useState({
    strategy: "all",
    status: "all",
    risk: "all",
    result: "all",
    interval: "all",
    trend: "all"
  });

  useEffect(() => {
    loadTrades();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trades, searchTerm, filters]);

  const loadTrades = async () => {
    try {
      const tradesData = await Trade.list('-entry_date');
      setTrades(tradesData);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTradeUpdated = () => {
    loadTrades(); // Reload trades when a trade is updated
  };

  const applyFilters = () => {
    let filtered = [...trades];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(trade =>
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trade.technical && trade.technical.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trade.dca_group_id && trade.dca_group_id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "all") {
        filtered = filtered.filter(trade => trade[key] === value);
      }
    });

    setFilteredTrades(filtered);
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      strategy: "all",
      status: "all",
      risk: "all",
      result: "all",
      interval: "all",
      trend: "all"
    });
    setSearchTerm("");
  };

  const exportToCSV = () => {
    const csvHeaders = [
      'Symbol', 'Strategy', 'Entry Date', 'Price', 'Quantity', 
      'Capital', 'Risk', 'P&L', 'Percentage', 'Status', 'Result'
    ];

    const csvData = filteredTrades.map(trade => [
      trade.symbol,
      trade.strategy,
      trade.entry_date,
      trade.price,
      trade.quantity,
      trade.capital,
      trade.risk,
      trade.pnl || 0,
      trade.percentage || 0,
      trade.status,
      trade.result
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trading-journal-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDCAGroups = () => {
    const groups = {};
    filteredTrades.forEach(trade => {
      if (trade.dca_group_id) {
        if (!groups[trade.dca_group_id]) {
          groups[trade.dca_group_id] = [];
        }
        groups[trade.dca_group_id].push(trade);
      }
    });
    return groups;
  };

  const dcaGroups = getDCAGroups();
  const nonDCATrades = filteredTrades.filter(trade => !trade.dca_group_id);

  return (
    <div className="min-h-screen p-6" style={{background: 'linear-gradient(135deg, #0A0F1F 0%, #141B30 100%)'}}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Trading Journal</h1>
              <p className="text-gray-400 font-mono">
                {filteredTrades.length} of {trades.length} trades
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              disabled={filteredTrades.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Link to={createPageUrl("AddTrade")}>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Trade
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-400" />
                Search & Filter
              </CardTitle>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`border-gray-600 text-gray-300 hover:bg-gray-800 ${showFilters ? 'bg-gray-800' : ''}`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGroupByDCA(!groupByDCA)}
                  className={`border-gray-600 text-gray-300 hover:bg-gray-800 ${groupByDCA ? 'bg-gray-800' : ''}`}
                >
                  DCA View
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by symbol, strategy, technical analysis, or DCA group..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              {(searchTerm || Object.values(filters).some(v => v !== "all")) && (
                <Button
                  variant="ghost"
                  onClick={clearAllFilters}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  Clear All
                </Button>
              )}
            </div>

            {showFilters && (
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {groupByDCA && Object.keys(dcaGroups).length > 0 ? (
          <div className="space-y-4">
            {/* DCA Groups */}
            {Object.entries(dcaGroups).map(([groupId, groupTrades]) => (
              <DCAGroupView
                key={groupId}
                groupId={groupId}
                trades={groupTrades}
                onTradeUpdated={handleTradeUpdated}
              />
            ))}
            
            {/* Non-DCA Trades */}
            {nonDCATrades.length > 0 && (
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Individual Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <TradeTable trades={nonDCATrades} isLoading={isLoading} onTradeUpdated={handleTradeUpdated} />
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-0">
              <TradeTable trades={filteredTrades} isLoading={isLoading} onTradeUpdated={handleTradeUpdated} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
