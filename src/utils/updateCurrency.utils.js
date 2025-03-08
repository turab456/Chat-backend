// require('dotenv').config();
// const axios = require('axios');
// const { Currency } = require('../models'); // Adjust path if needed

import axios from "axios";
import Currency from "../models/common_model/currency.model.js";

// const API_URL = process.env.CURRENCY_API_URL;
// const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CHF']; // Add more as needed

const API_URL = process.env.CURRENCY_API_URL;
const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR", "CHF"]; // Add more if needed

// Mapping of currency codes to currency names & symbols
const CURRENCY_DETAILS = {
  USD: { name: "United States Dollar", symbol: "$" },
  EUR: { name: "Euro", symbol: "€" },
  GBP: { name: "British Pound", symbol: "£" },
  JPY: { name: "Japanese Yen", symbol: "¥" },
  INR: { name: "Indian Rupee", symbol: "₹" },
  CHF: { name: "Swiss Franc", symbol: "CHF" },
};

export default async function updateCurrencies() {
  try {
    console.log("🔄 Fetching latest currency exchange rates...");
    const response = await axios.get(API_URL);
    const exchangeRates = response.data.rates;

    if (!exchangeRates) {
      console.error("❌ Failed to fetch exchange rates.");
      return;
    }

    for (const currencyCode of SUPPORTED_CURRENCIES) {
      const rate = exchangeRates[currencyCode];

      if (rate) {
        await Currency.upsert(
          {
            code: currencyCode,
            name: CURRENCY_DETAILS[currencyCode]?.name || currencyCode, // Ensure name is provided
            symbol: CURRENCY_DETAILS[currencyCode]?.symbol || "", // Ensure symbol is provided
            exchange_rate: rate,
            is_active: true,
          },
          { where: { code: currencyCode } }
        );

        // console.log(
        //   `✅ Updated: ${currencyCode} (${CURRENCY_DETAILS[currencyCode]?.name}) → ${rate} (${CURRENCY_DETAILS[currencyCode]?.symbol})`
        // );
      } else {
        console.warn(`⚠️ Missing exchange rate for ${currencyCode}`);
      }
    }
  } catch (error) {
    console.error("⚠️ Error updating currency rates:", error.message);
  }
}
