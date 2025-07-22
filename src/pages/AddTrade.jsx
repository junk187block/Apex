import React, { useState, useEffect } from "react";
import { Trade } from "@/entities/Trade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Target, TrendingUp, DollarSign, AlertTriangle, Link2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AddTrade() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingDCAGroups, setExistingDCAGroups] = useState([]);
  const [linkToExistingDCA, setLinkToExistingDCA] = useState(false);
  const [tradeData, setTradeData] = useState({
    symbol: "",
    strategy: "",
    capital: "",
    entry_date: new Date().toISOString().slice(0, 16),
    price: "",
    quantity: "",
    interval: "",
    trend: "",
    technical: "",
    fundamental: "",
    risk: "",
    order_type: "Entry",
    status: "Open",
    take_profit: "",
    stop_loss: "",
    notes: "",
    dca_group_id: ""
  });

  useEffect(() => {
    loadExistingDCAGroups();
  }, []);

  const loadExistingDCAGroups = async () => {
    try {
      const trades = await Trade.list('-entry_date');
      const dcaGroups = {};
      
      trades.forEach(trade => {
        if (trade.dca_group_id && trade.status === 'Open') {
          if (!dcaGroups[trade.dca_group_id]) {
            dcaGroups[trade.dca_group_id] = {
              id: trade.dca_group_id,
              symbol: trade.symbol,
              strategy: trade.strategy,
              count: 0,
              avgPrice: 0,
              totalQuantity: 0
            };
          }
          dcaGroups[trade.dca_group_id].count++;
          dcaGroups[trade.dca_group_id].totalQuantity += trade.quantity;
          dcaGroups[trade.dca_group_id].avgPrice = 
            ((dcaGroups[trade.dca_group_id].avgPrice * (dcaGroups[trade.dca_group_id].count - 1)) + trade.price) / 
            dcaGroups[trade.dca_group_id].count;
        }
      });
      
      setExistingDCAGroups(Object.values(dcaGroups));
    } catch (error) {
      console.error('Error loading DCA groups:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setTradeData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate DCA Group ID for DCA strategies when not linking to existing
    if (field === 'strategy' && value.includes('DCA') && !linkToExistingDCA && !tradeData.dca_group_id) {
      const timestamp = Date.now().toString().slice(-6);
      setTradeData(prev => ({
        ...prev,
        dca_group_id: `DCA-${tradeData.symbol || 'XXX'}-${timestamp}`
      }));
    }

    // Update symbol in DCA group ID when symbol changes and not linking to existing
    if (field === 'symbol' && tradeData.strategy.includes('DCA') && !linkToExistingDCA) {
      const currentId = tradeData.dca_group_id;
      if (currentId && currentId.startsWith('DCA-')) {
        const parts = currentId.split('-');
        if (parts.length === 3) {
          setTradeData(prev => ({
            ...prev,
            dca_group_id: `DCA-${value}-${parts[2]}`
          }));
        }
      }
    }
  };

  const handleLinkToExistingDCA = (checked) => {
    setLinkToExistingDCA(checked);
    if (!checked) {
      // Generate new DCA group ID if strategy is DCA
      if (tradeData.strategy.includes('DCA')) {
        const timestamp = Date.now().toString().slice(-6);
        setTradeData(prev => ({
          ...prev,
          dca_group_id: `DCA-${tradeData.symbol || 'XXX'}-${timestamp}`
        }));
      } else {
        setTradeData(prev => ({
          ...prev,
          dca_group_id: ""
        }));
      }
    } else {
      setTradeData(prev => ({
        ...prev,
        dca_group_id: ""
      }));
    }
  };

  const calculateRiskReward = () => {
    const entry = parseFloat(tradeData.price);
    const tp = parseFloat(tradeData.take_profit);
    const sl = parseFloat(tradeData.stop_loss);
    
    if (entry && tp && sl) {
      const reward = Math.abs(tp - entry);
      const risk = Math.abs(entry - sl);
      return risk > 0 ? (reward / risk).toFixed(2) : 0;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const processedData = {
        ...tradeData,
        capital: parseFloat(tradeData.capital),
        price: parseFloat(tradeData.price),
        quantity: parseFloat(tradeData.quantity),
        take_profit: tradeData.take_profit ? parseFloat(tradeData.take_profit) : null,
        stop_loss: tradeData.stop_loss ? parseFloat(tradeData.stop_loss) : null,
        result: "Open",
        pnl: 0,
        percentage: 0
      };

      await Trade.create(processedData);
      navigate(createPageUrl("Journal"));
    } catch (error) {
      console.error('Error creating trade:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const riskReward = calculateRiskReward();
  const isDCAStrategy = tradeData.strategy.includes('DCA');
  const availableDCAGroups = existingDCAGroups.filter(group => 
    !tradeData.symbol || group.symbol === tradeData.symbol
  );

  return (
    <div className="min-h-screen p-6" style={{background: 'linear-gradient(135deg, #0A0F1F 0%, #141B30 100%)'}}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Add New Trade</h1>
            <p className="text-gray-400 font-mono">Log your trading position with precision</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Trade Info */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Trade Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 font-semibold">Symbol *</Label>
                  <Input
                    value={tradeData.symbol}
                    onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                    placeholder="BTC, ETH, etc."
                    className="bg-gray-800 border-gray-600 text-white font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 font-semibold">Strategy *</Label>
                  <Select value={tradeData.strategy} onValueChange={(value) => handleInputChange('strategy', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="R:R">Risk:Reward</SelectItem>
                      <SelectItem value="DCA T.A">DCA Technical Analysis</SelectItem>
                      <SelectItem value="TSL">Trailing Stop Loss</SelectItem>
                      <SelectItem value="Scalp">Scalping</SelectItem>
                      <SelectItem value="R:R Swing">R:R Swing Trade</SelectItem>
                      <SelectItem value="TSL Scalp">TSL Scalping</SelectItem>
                      <SelectItem value="DCA Scalp">DCA Scalping</SelectItem>
                      <SelectItem value="Breakout">Breakout</SelectItem>
                      <SelectItem value="Reversal">Reversal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 font-semibold">Interval *</Label>
                  <Select value={tradeData.interval} onValueChange={(value) => handleInputChange('interval', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Timeframe" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="1m">1 Minute</SelectItem>
                      <SelectItem value="5m">5 Minutes</SelectItem>
                      <SelectItem value="15m">15 Minutes</SelectItem>
                      <SelectItem value="30m">30 Minutes</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="4h">4 Hours</SelectItem>
                      <SelectItem value="1d">1 Day</SelectItem>
                      <SelectItem value="1w">1 Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 font-semibold">Capital *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tradeData.capital}
                    onChange={(e) => handleInputChange('capital', e.target.value)}
                    placeholder="1000.00"
                    className="bg-gray-800 border-gray-600 text-white font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 font-semibold">Entry Price *</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={tradeData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.000000"
                    className="bg-gray-800 border-gray-600 text-white font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 font-semibold">Quantity *</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={tradeData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="100.00"
                    className="bg-gray-800 border-gray-600 text-white font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 font-semibold">Entry Date *</Label>
                  <Input
                    type="datetime-local"
                    value={tradeData.entry_date}
                    onChange={(e) => handleInputChange('entry_date', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DCA Linking Section */}
          {isDCAStrategy && (
            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-purple-400" />
                  DCA Position Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="linkToExisting"
                    checked={linkToExistingDCA}
                    onCheckedChange={handleLinkToExistingDCA}
                    className="border-purple-500 text-purple-400"
                  />
                  <Label htmlFor="linkToExisting" className="text-gray-300 font-semibold cursor-pointer">
                    Link to existing DCA position
                  </Label>
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-400 border-purple-500/30">
                    {availableDCAGroups.length} available
                  </Badge>
                </div>

                {linkToExistingDCA ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300 font-semibold">Select DCA Position</Label>
                      <Select 
                        value={tradeData.dca_group_id} 
                        onValueChange={(value) => handleInputChange('dca_group_id', value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Choose existing DCA position" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {availableDCAGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-400" />
                                <span className="font-mono">{group.id}</span>
                                <Badge variant="outline" className="text-xs bg-gray-700 text-gray-300">
                                  {group.count} entries
                                </Badge>
                                <span className="text-sm text-gray-400">
                                  Avg: ${group.avgPrice.toFixed(4)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {availableDCAGroups.length === 0 && (
                      <div className="p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
                        <p className="text-gray-400 text-sm">
                          No existing DCA positions found for {tradeData.symbol || 'the selected symbol'}.
                          A new DCA group will be created automatically.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-semibold">New DCA Group ID</Label>
                    <Input
                      value={tradeData.dca_group_id}
                      onChange={(e) => handleInputChange('dca_group_id', e.target.value)}
                      placeholder="DCA-BTC-001"
                      className="bg-gray-800 border-gray-600 text-white font-mono"
                    />
                    <p className="text-gray-500 text-xs">
                      Auto-generated based on symbol and timestamp. You can customize it.
                    </p>
                  </div>
                )}

                {/* DCA Preview */}
                {tradeData.dca_group_id && (
                  <div className="p-4 bg-purple-900/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-purple-900/30 text-purple-400 border-purple-500/30">
                        DCA Position
                      </Badge>
                      <span className="font-mono text-purple-300">{tradeData.dca_group_id}</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      This trade will be {linkToExistingDCA ? 'added to existing' : 'part of new'} DCA position tracking.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Risk Management */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Risk Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 font-semibold">Risk Level *</Label>
                  <Select value={tradeData.risk} onValueChange={(value) => handleInputChange('risk', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Risk level" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="Very Low">Very Low</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Very High">Very High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 font-semibold">Take Profit</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={tradeData.take_profit}
                    onChange={(e) => handleInputChange('take_profit', e.target.value)}
                    placeholder="0.000000"
                    className="bg-gray-800 border-gray-600 text-white font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 font-semibold">Stop Loss</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={tradeData.stop_loss}
                    onChange={(e) => handleInputChange('stop_loss', e.target.value)}
                    placeholder="0.000000"
                    className="bg-gray-800 border-gray-600 text-white font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 font-semibold">R:R Ratio</Label>
                  <div className="p-3 bg-gray-800 border border-gray-600 rounded-md">
                    <Badge 
                      variant="outline" 
                      className={`${riskReward >= 2 ? 'text-green-400 border-green-500' : riskReward >= 1 ? 'text-yellow-400 border-yellow-500' : 'text-red-400 border-red-500'} font-mono text-lg`}
                    >
                      1:{riskReward}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Analysis */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Market Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 font-semibold">Market Trend *</Label>
                  <Select value={tradeData.trend} onValueChange={(value) => handleInputChange('trend', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Market bias" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="Bull">Bullish</SelectItem>
                      <SelectItem value="Bear">Bearish</SelectItem>
                      <SelectItem value="Break">Breakout</SelectItem>
                      <SelectItem value="Side">Sideways</SelectItem>
                      <SelectItem value="Reversal">Reversal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 font-semibold">Technical Analysis</Label>
                  <Input
                    value={tradeData.technical}
                    onChange={(e) => handleInputChange('technical', e.target.value)}
                    placeholder="RSI, MACD, Support/Resistance"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300 font-semibold">Fundamental Analysis</Label>
                <Input
                  value={tradeData.fundamental}
                  onChange={(e) => handleInputChange('fundamental', e.target.value)}
                  placeholder="News, events, market sentiment"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 font-semibold">Notes</Label>
                <Textarea
                  value={tradeData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional trade notes, setup details, etc."
                  className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("Journal"))}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold px-8"
            >
              {isSubmitting ? "Adding Trade..." : "Add Trade"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}