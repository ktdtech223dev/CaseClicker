@echo off
echo.
echo   Running CS2 Price Aggregator...
echo   This scrapes CSGOSKINS.GG + Steam Market
echo   and averages prices for all skins.
echo.
node scripts/price-update.js
echo.
pause
