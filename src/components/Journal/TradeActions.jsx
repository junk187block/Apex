import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trade } from "@/entities/Trade";
import { X, TrendingUp, TrendingDown } from "lucide-react";

export default function TradeActions({ trade, onTradeUpdated }) {
  const [isClosing, setIsClosing] = useState(false);
  const [exitData, setExitData] = useState({
    exit_price: "",
    exit_date: new Date().toISOString().slice(0, 16),
    result: "",
    order_type: "Exit Full"
  });

  const handleClosePosition = async () => {
    if (!exitData.exit_price || !exitData.result) return;

    try {
      const exitPrice = parseFloat(exitData.exit_price);
      const pnl = (exitPrice - trade.price) * trade.quantity;
      const percentage = ((exitPrice - trade.price) / trade.price) * 100;

      const updatedTrade = {
        ...trade,
        exit_price: exitPrice,
        exit_date: exitData.exit_date,
        result: exitData.result,
        status: "Closed",
        pnl: pnl,
        percentage: percentage,
        order_type: exitData.order_type
      };

      await Trade.update(trade.id, updatedTrade);
      onTradeUpdated?.();
      setIsClosing(false);
      
      // Reset form
      setExitData({
        exit_price: "",
        exit_date: new Date().toISOString().slice(0, 16),
        result: "",
        order_type: "Exit Full"
      });
    } catch (error) {
      console.error('Error closing trade:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const calculatePreviewPnL = () => {
    if (!exitData.exit_price) return 0;
    return (parseFloat(exitData.exit_price) - trade.price) * trade.quantity;
  };

  const calculatePreviewPercentage = () => {
    if (!exitData.exit_price) return 0;
    return ((parseFloat(exitData.exit_price) - trade.price) / trade.price) * 100;
  };

  const previewPnL = calculatePreviewPnL();
  const previewPercentage = calculatePreviewPercentage();

  if (trade.status === 'Closed') {
    return (
      <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-600">
        Closed
      </Badge>
    );
  }

  return (
    <Dialog open={isClosing} onOpenChange={setIsClosing}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-red-600 text-red-400 hover:bg-red-900/20 font-mono"
        >
          <X className="w-4 h-4 mr-1" />
          Close Position
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <X className="w-5 h-5 text-red-400" />
            Close Position: {trade.symbol}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Trade Summary */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Entry Price:</span>
                <div className="font-mono text-white">${trade.price.toFixed(6)}</div>
              </div>
              <div>
                <span className="text-gray-400">Quantity:</span>
                <div className="font-mono text-white">{trade.quantity.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-400">Capital:</span>
                <div className="font-mono text-white">{formatCurrency(trade.capital)}</div>
              </div>
              <div>
                <span className="text-gray-400">Strategy:</span>
                <div className="text-white">{trade.strategy}</div>
              </div>
            </div>
          </div>

          {/* Exit Details */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-gray-300 font-semibold">Exit Price *</Label>
              <Input
                type="number"
                step="0.000001"
                value={exitData.exit_price}
                onChange={(e) => setExitData({...exitData, exit_price: e.target.value})}
                placeholder="0.000000"
                className="bg-gray-800 border-gray-600 text-white font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 font-semibold">Exit Date *</Label>
              <Input
                type="datetime-local"
                value={exitData.exit_date}
                onChange={(e) => setExitData({...exitData, exit_date: e.target.value})}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 font-semibold">Result *</Label>
              <Select 
                value={exitData.result} 
                onValueChange={(value) => setExitData({...exitData, result: value})}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Win">Win</SelectItem>
                  <SelectItem value="Loss">Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 font-semibold">Order Type</Label>
              <Select 
                value={exitData.order_type} 
                onValueChange={(value) => setExitData({...exitData, order_type: value})}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Exit Full">Exit Full</SelectItem>
                  <SelectItem value="Exit Partial">Exit Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* P&L Preview */}
          {exitData.exit_price && (
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">P&L Preview:</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {previewPnL >= 0 ? 
                    <TrendingUp className="w-4 h-4 text-green-400" /> : 
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  }
                  <span className={`font-bold font-mono text-lg ${
                    previewPnL >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {previewPnL >= 0 ? '+' : ''}{formatCurrency(previewPnL)}
                  </span>
                </div>
                <div className={`font-mono ${
                  previewPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {previewPercentage > 0 ? '+' : ''}{previewPercentage.toFixed(2)}%
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsClosing(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClosePosition}
              disabled={!exitData.exit_price || !exitData.result}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Close Position
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}