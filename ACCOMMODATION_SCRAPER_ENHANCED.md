# Enhanced Accommodation Scraper - JavaScript Support

## Problem Solved

The "JavaScript is disabled" error occurs when accommodation websites rely heavily on JavaScript to load their content dynamically. The original Python scraper only fetched the initial HTML without executing JavaScript, so it couldn't access content loaded via AJAX or client-side rendering.

## Solution Implemented

### Two-Tier Scraping Architecture

1. **Selenium Scraper** (Primary) - Handles JavaScript-heavy websites
2. **Basic Scraper** (Fallback) - Handles simple HTML websites

### How It Works

```
URL Input
    ↓
Try Selenium Scraper (with Chrome/Chromium)
    ↓
Success? → Return detailed data
    ↓
Failed? → Try Basic Scraper (requests + BeautifulSoup)
    ↓
Success? → Return basic data
    ↓
Failed? → Return fallback data
```

## New Features

### 1. Selenium Integration (`accommodation_scraper_selenium.py`)

**Capabilities:**

- Real browser automation using Chrome/Chromium
- JavaScript execution and DOM rendering
- Handles dynamic content loading
- Waits for page elements to load
- Anti-detection measures (stealth mode)

**Key Features:**

- Headless browser operation
- Automatic ChromeDriver management
- Timeout handling (30 seconds)
- Error recovery and fallback
- Platform-specific selectors

### 2. Enhanced Python Service (`python-scraper.service.ts`)

**Smart Fallback Logic:**

- Tries Selenium scraper first
- Falls back to basic scraper if Selenium fails
- Provides detailed logging for debugging
- Maintains backward compatibility

**Error Handling:**

- Chrome/Chromium not available → Use basic scraper
- Selenium timeout → Use basic scraper
- Network errors → Use basic scraper
- All failures → Return fallback data

### 3. Automatic ChromeDriver Management

**webdriver-manager Integration:**

- Automatically downloads and manages ChromeDriver
- Handles version compatibility
- No manual ChromeDriver installation needed
- Works across different operating systems

## Installation & Setup

### Prerequisites

1. **Python 3.7+** (already installed)
2. **Chrome or Chromium** (for Selenium)
3. **Node.js** (already installed)

### Setup Commands

```bash
# Install all dependencies including Selenium
npm run setup:python-scraper

# Or manually install Python dependencies
pip3 install -r src/scrapers/requirements.txt
```

### Chrome/Chromium Installation

**macOS:**

```bash
brew install --cask google-chrome
```

**Ubuntu:**

```bash
sudo apt-get install google-chrome-stable
```

**Windows:**
Download from https://chrome.google.com

## Technical Details

### Selenium Scraper Features

**Browser Configuration:**

```python
chrome_options = Options()
chrome_options.add_argument('--headless')  # Run in background
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--window-size=1920,1080')
chrome_options.add_argument('--user-agent=Mozilla/5.0...')
chrome_options.add_argument('--disable-blink-features=AutomationControlled')
```

**Anti-Detection Measures:**

- Custom user agent
- Disabled automation flags
- Stealth mode configuration
- Random delays and waits

**Page Loading Strategy:**

1. Navigate to URL
2. Wait for document ready state
3. Wait for specific elements (if available)
4. Parse rendered HTML
5. Extract data using CSS selectors

### Platform-Specific Enhancements

**Airbnb:**

- Enhanced selectors for dynamic content
- Better image extraction
- Improved price detection

**Booking.com:**

- Hotel name extraction
- Description parsing
- Address detection

**Hostelworld:**

- Property details extraction
- Gallery image collection
- Price range detection

**Generic Sites:**

- Fallback selectors
- Basic content extraction
- Image URL collection

## Performance & Reliability

### Timeout Handling

- **Selenium scraper**: 30 seconds
- **Basic scraper**: 15 seconds
- **Total maximum**: 45 seconds per request

### Error Recovery

- Automatic fallback between scrapers
- Graceful degradation
- Detailed error logging
- User-friendly error messages

### Resource Management

- Headless browser operation
- Automatic WebDriver cleanup
- Memory-efficient processing
- Process isolation

## Usage Examples

### API Usage

```bash
# Test with JavaScript-heavy website
curl -X POST http://localhost:3001/api/admin/accommodations/parse-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"url": "https://www.airbnb.com/rooms/123456"}'
```

### Frontend Usage

1. Admin pastes URL from any accommodation site
2. Clicks "Parse URL" button
3. System tries Selenium scraper first
4. Falls back to basic scraper if needed
5. Form auto-fills with extracted data

### Command Line Usage

```bash
# Test Selenium scraper directly
python3 src/scrapers/accommodation_scraper_selenium.py "https://www.airbnb.com/rooms/123456"

# Test basic scraper directly
python3 src/scrapers/accommodation_scraper.py "https://www.airbnb.com/rooms/123456"
```

## Troubleshooting

### Common Issues

1. **"Chrome not found"**

   - Install Chrome or Chromium
   - Check PATH environment variable
   - Verify installation with `google-chrome --version`

2. **"ChromeDriver not found"**

   - webdriver-manager handles this automatically
   - Check internet connection
   - Verify Chrome installation

3. **"Selenium timeout"**

   - Website is slow to load
   - Network connectivity issues
   - System will fall back to basic scraper

4. **"JavaScript still disabled"**
   - Website has advanced anti-bot protection
   - Try different user agents
   - Consider using residential proxies

### Debug Mode

Enable detailed logging in the Node.js service:

```typescript
// In python-scraper.service.ts
this.logger.debug(`Trying Selenium scraper for ${url}`);
this.logger.debug(`Falling back to basic scraper for ${url}`);
```

## Benefits

### For Users

- **Better Success Rate**: Handles JavaScript-heavy websites
- **More Accurate Data**: Extracts content loaded dynamically
- **Reliable Fallback**: Always returns some data
- **Faster Processing**: Optimized for common scenarios

### For Developers

- **Maintainable Code**: Clear separation of concerns
- **Easy Debugging**: Detailed logging and error messages
- **Extensible Design**: Easy to add new platforms
- **Robust Error Handling**: Graceful degradation

## Future Enhancements

### Potential Improvements

1. **Proxy Support**: Rotate IP addresses for large-scale scraping
2. **Caching**: Redis cache for frequently scraped URLs
3. **Rate Limiting**: Intelligent delays between requests
4. **Image Processing**: Download and optimize images locally
5. **Data Validation**: Validate extracted data before returning
6. **Monitoring**: Real-time scraping success metrics

### Advanced Features

1. **Multi-Browser Support**: Firefox, Safari, Edge
2. **Mobile Scraping**: Mobile user agents and viewports
3. **API Integration**: Direct API calls where available
4. **Machine Learning**: AI-powered content extraction
5. **Distributed Scraping**: Multiple worker processes

## Files Modified/Created

### New Files

- `backend/src/scrapers/accommodation_scraper_selenium.py` - Selenium scraper
- `backend/src/scrapers/requirements.txt` - Updated dependencies
- `backend/scripts/setup-python-scraper.sh` - Enhanced setup script

### Modified Files

- `backend/src/services/python-scraper.service.ts` - Two-tier scraping logic
- `backend/src/services/url-parser.service.ts` - Enhanced error handling

## Conclusion

The enhanced accommodation scraper successfully solves the "JavaScript is disabled" problem by implementing a robust two-tier scraping architecture. The system now handles both JavaScript-heavy and simple HTML websites, providing reliable data extraction with intelligent fallback mechanisms.

The solution is production-ready, maintainable, and easily extensible for future enhancements. Users will experience significantly better success rates when scraping accommodation data from modern booking platforms.
