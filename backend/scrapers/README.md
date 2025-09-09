# Accommodation Scraper

This Python scraper service extracts detailed accommodation information from various booking platforms including Airbnb, Booking.com, Hostelworld, Hotels.com, Expedia, and TripAdvisor.

## Features

- **Multi-platform support**: Works with major accommodation booking sites
- **Detailed data extraction**: Extracts name, description, address, price range, and images
- **Image gallery support**: Collects multiple images from property galleries
- **Fallback handling**: Gracefully handles errors and provides fallback data
- **Node.js integration**: Seamlessly integrated with the NestJS backend

## Supported Platforms

- **Airbnb** (airbnb.com, airbnb.fr)
- **Booking.com**
- **Hostelworld**
- **Hotels.com**
- **Expedia**
- **TripAdvisor**
- **Generic sites** (fallback scraper)

## Installation

### Prerequisites

- Python 3.7 or higher
- pip3 (Python package manager)

### Setup

1. Install Python dependencies:

   ```bash
   npm run setup:python-scraper
   ```

   Or manually:

   ```bash
   pip3 install -r src/scrapers/requirements.txt
   ```

### Dependencies

- `requests>=2.28.0` - HTTP library for web requests
- `beautifulsoup4>=4.11.0` - HTML parsing library
- `lxml>=4.9.0` - XML/HTML parser

## Usage

### Command Line

```bash
python3 src/scrapers/accommodation_scraper.py "https://www.airbnb.com/rooms/123456"
```

### Node.js Integration

The scraper is automatically used by the URL parser service:

```typescript
// The URL parser will automatically use the Python scraper
const result = await urlParserService.parseAccommodationUrl(url);
```

### API Endpoint

```bash
curl -X POST http://localhost:3001/api/admin/accommodations/parse-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"url": "https://www.airbnb.com/rooms/123456"}'
```

## Data Extraction

The scraper extracts the following information:

- **name**: Property name/title
- **description**: Property description
- **address**: Property address
- **contactInfo**: Contact information (if available)
- **priceRange**: Price range information
- **imagesUrl**: Comma-separated list of image URLs (up to 5 images)
- **sourceUrl**: Original URL

## How It Works

1. **URL Analysis**: Determines the platform based on the URL domain
2. **Web Scraping**: Makes HTTP requests with proper headers to avoid blocking
3. **HTML Parsing**: Uses BeautifulSoup to parse HTML and extract data
4. **Data Extraction**: Applies platform-specific selectors to find relevant information
5. **Image Collection**: Gathers image URLs from galleries and carousels
6. **Fallback Handling**: Provides sensible defaults if extraction fails

## Platform-Specific Selectors

### Airbnb

- Name: `h1[data-testid="listing-title"]`, `h1._14i3z6h`
- Description: `[data-testid="listing-description"]`, `._1n81at5`
- Address: `[data-testid="listing-location"]`
- Price: `[data-testid="price"]`, `._1y74zjx`
- Images: `img[data-testid="image"]`, `img._1n81at5`

### Booking.com

- Name: `h2#hp_hotel_name`, `.hp__hotel_name`
- Description: `#property_description_content`, `.property_description`
- Address: `.hp_address_subtitle`, `[data-testid="address"]`
- Price: `.prco-valign-middle-helper`, `.bui-price-display__value`
- Images: `.hp_gallery img`, `[data-testid="gallery-image"]`

### Hostelworld

- Name: `.hw-property-name`, `h1[data-testid="property-name"]`
- Description: `.hw-property-description`
- Address: `.hw-property-address`
- Price: `.hw-price`
- Images: `.hw-gallery img`

## Error Handling

The scraper includes comprehensive error handling:

- **Network errors**: Timeout and connection issues
- **Parsing errors**: Invalid HTML or missing elements
- **Platform changes**: Updated selectors and page structures
- **Rate limiting**: Respects website policies

## Performance

- **Timeout**: 30-second timeout per request
- **Image limit**: Maximum 5 images per property
- **Caching**: No built-in caching (can be added)
- **Concurrent requests**: Single-threaded for simplicity

## Troubleshooting

### Common Issues

1. **Python not found**: Ensure Python 3 is installed and in PATH
2. **Dependencies missing**: Run `npm run setup:python-scraper`
3. **Scraping fails**: Check if the URL is accessible and not blocked
4. **Empty results**: The property might not exist or have changed structure

### Debug Mode

Enable debug logging in the Node.js service to see detailed scraping information:

```typescript
// In python-scraper.service.ts
this.logger.debug(`Scraping ${url} with Python scraper`);
```

## Future Enhancements

- **More platforms**: Add support for additional booking sites
- **Better selectors**: Update selectors as platforms change
- **Caching**: Add Redis caching for frequently scraped URLs
- **Rate limiting**: Implement intelligent rate limiting
- **Proxy support**: Add proxy rotation for large-scale scraping
- **Data validation**: Validate extracted data before returning

## Contributing

When adding support for new platforms:

1. Add platform detection in `scrape_accommodation()`
2. Create a new `_scrape_[platform]()` method
3. Define appropriate CSS selectors for the platform
4. Test with real URLs from the platform
5. Update this README with platform information

## License

This scraper is part of the wedding application and follows the same license terms.
