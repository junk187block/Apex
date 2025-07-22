import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function FilterPanel({ filters, onFilterChange }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="space-y-2">
        <Label className="text-gray-300 text-sm font-semibold">Strategy</Label>
        <Select value={filters.strategy} onValueChange={(value) => onFilterChange('strategy', value)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Strategies</SelectItem>
            <SelectItem value="R:R">Risk:Reward</SelectItem>
            <SelectItem value="DCA T.A">DCA Technical</SelectItem>
            <SelectItem value="TSL">Trailing Stop</SelectItem>
            <SelectItem value="Scalp">Scalping</SelectItem>
            <SelectItem value="R:R Swing">R:R Swing</SelectItem>
            <SelectItem value="TSL Scalp">TSL Scalp</SelectItem>
            <SelectItem value="DCA Scalp">DCA Scalp</SelectItem>
            <SelectItem value="Breakout">Breakout</SelectItem>
            <SelectItem value="Reversal">Reversal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300 text-sm font-semibold">Status</Label>
        <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300 text-sm font-semibold">Risk</Label>
        <Select value={filters.risk} onValueChange={(value) => onFilterChange('risk', value)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risks</SelectItem>
            <SelectItem value="Very Low">Very Low</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Very High">Very High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300 text-sm font-semibold">Result</Label>
        <Select value={filters.result} onValueChange={(value) => onFilterChange('result', value)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="Win">Wins</SelectItem>
            <SelectItem value="Loss">Losses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300 text-sm font-semibold">Interval</Label>
        <Select value={filters.interval} onValueChange={(value) => onFilterChange('interval', value)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Intervals</SelectItem>
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

      <div className="space-y-2">
        <Label className="text-gray-300 text-sm font-semibold">Trend</Label>
        <Select value={filters.trend} onValueChange={(value) => onFilterChange('trend', value)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trends</SelectItem>
            <SelectItem value="Bull">Bullish</SelectItem>
            <SelectItem value="Bear">Bearish</SelectItem>
            <SelectItem value="Break">Breakout</SelectItem>
            <SelectItem value="Side">Sideways</SelectItem>
            <SelectItem value="Reversal">Reversal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}