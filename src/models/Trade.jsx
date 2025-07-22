{
  "name": "Trade",
  "type": "object",
  "properties": {
    "symbol": {
      "type": "string",
      "description": "Asset traded (e.g., BTC, ETH, MKR)"
    },
    "strategy": {
      "type": "string",
      "enum": [
        "R:R",
        "DCA T.A",
        "TSL",
        "Scalp",
        "R:R Swing",
        "TSL Scalp",
        "DCA Scalp",
        "Breakout",
        "Reversal"
      ],
      "description": "Trading strategy used"
    },
    "capital": {
      "type": "number",
      "description": "Starting capital allocated to the trade"
    },
    "entry_date": {
      "type": "string",
      "format": "date-time",
      "description": "Timestamp of entry"
    },
    "exit_date": {
      "type": "string",
      "format": "date-time",
      "description": "Timestamp of exit (nullable for open positions)"
    },
    "price": {
      "type": "number",
      "description": "Entry price for this leg"
    },
    "exit_price": {
      "type": "number",
      "description": "Exit price for this leg"
    },
    "quantity": {
      "type": "number",
      "description": "Amount bought/sold"
    },
    "interval": {
      "type": "string",
      "enum": [
        "1m",
        "5m",
        "15m",
        "30m",
        "1h",
        "4h",
        "1d",
        "1w"
      ],
      "description": "Timeframe"
    },
    "trend": {
      "type": "string",
      "enum": [
        "Bull",
        "Bear",
        "Break",
        "Side",
        "Reversal"
      ],
      "description": "Market bias"
    },
    "technical": {
      "type": "string",
      "description": "Technical indicators/patterns used"
    },
    "fundamental": {
      "type": "string",
      "description": "Fundamental rationale"
    },
    "risk": {
      "type": "string",
      "enum": [
        "Very Low",
        "Low",
        "Medium",
        "High",
        "Very High"
      ],
      "description": "Risk level"
    },
    "result": {
      "type": "string",
      "enum": [
        "Win",
        "Loss",
        "Open"
      ],
      "description": "Trade outcome"
    },
    "percentage": {
      "type": "number",
      "description": "ROI % for this leg"
    },
    "pnl": {
      "type": "number",
      "description": "Profit/Loss in USD for this leg"
    },
    "dca_group_id": {
      "type": "string",
      "description": "Identifier to group DCA entries"
    },
    "order_type": {
      "type": "string",
      "enum": [
        "Entry",
        "Exit Partial",
        "Exit Full"
      ],
      "description": "Order type"
    },
    "status": {
      "type": "string",
      "enum": [
        "Open",
        "Closed"
      ],
      "description": "Position status"
    },
    "take_profit": {
      "type": "number",
      "description": "Take profit level"
    },
    "stop_loss": {
      "type": "number",
      "description": "Stop loss level"
    },
    "notes": {
      "type": "string",
      "description": "Additional trade notes"
    }
  },
  "required": [
    "symbol",
    "strategy",
    "capital",
    "entry_date",
    "price",
    "quantity",
    "interval",
    "trend",
    "risk",
    "result",
    "order_type",
    "status"
  ]
}