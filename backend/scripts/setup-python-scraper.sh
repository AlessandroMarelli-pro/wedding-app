#!/bin/bash

# Setup script for Python scraper dependencies

echo "Setting up Python scraper for accommodation data extraction..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    echo "   On macOS: brew install python3"
    echo "   On Ubuntu: sudo apt-get install python3 python3-pip"
    echo "   On Windows: Download from https://python.org"
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip first."
    exit 1
fi

echo "✅ pip3 found: $(pip3 --version)"

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r src/scrapers/requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Python dependencies installed successfully"
else
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

# Check for Chrome/Chromium
echo "Checking for Chrome/Chromium installation..."
if command -v google-chrome &> /dev/null; then
    echo "✅ Google Chrome found"
elif command -v chromium-browser &> /dev/null; then
    echo "✅ Chromium found"
elif command -v chromium &> /dev/null; then
    echo "✅ Chromium found"
else
    echo "⚠️  Chrome/Chromium not found. Selenium scraper will not work."
    echo "   Please install Chrome or Chromium for JavaScript-heavy websites:"
    echo "   On macOS: brew install --cask google-chrome"
    echo "   On Ubuntu: sudo apt-get install google-chrome-stable"
    echo "   On Windows: Download from https://chrome.google.com"
fi

# Install ChromeDriver
echo "Installing ChromeDriver..."
python3 -c "
import subprocess
import sys
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from webdriver_manager.chrome import ChromeDriverManager
    print('✅ ChromeDriver will be automatically managed by webdriver-manager')
except ImportError:
    print('⚠️  webdriver-manager not available, ChromeDriver may need manual installation')
    print('   Run: pip3 install webdriver-manager')
"

if [ $? -eq 0 ]; then
    echo "✅ ChromeDriver setup completed"
else
    echo "⚠️  ChromeDriver setup had issues, but basic scraper will still work"
fi

# Test the scraper
echo "Testing Python scraper..."
python3 src/scrapers/accommodation_scraper.py "https://www.airbnb.com/rooms/123456"

if [ $? -eq 0 ]; then
    echo "✅ Python scraper test successful"
else
    echo "⚠️  Python scraper test failed, but dependencies are installed"
fi

echo "🎉 Python scraper setup complete!"
echo ""
echo "The accommodation URL parser will now use Python scraping for detailed data extraction."
echo "If Python is not available, it will fall back to basic URL parsing."
