import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { join } from 'path';
import { ParsedAccommodationData } from './url-parser.service';

@Injectable()
export class PythonScraperService {
  private readonly logger = new Logger(PythonScraperService.name);
  private readonly pythonPath: string;
  private readonly scraperPath: string;

  constructor() {
    // Try to find Python executable
    this.pythonPath = this.findPythonExecutable() || 'python3';
    this.scraperPath = join('scrapers', 'accommodation_scraper.py');
  }

  async scrapeAccommodation(url: string): Promise<ParsedAccommodationData> {
    return new Promise((resolve, reject) => {
      if (!this.pythonPath) {
        this.logger.warn('Python not found, falling back to basic URL parsing');
        resolve(this.createFallbackResponse(url));
        return;
      }

      // Try Selenium scraper first, then fall back to basic scraper
      const seleniumScraperPath = join('scrapers', 'accommodation_scraper.py');
      const basicScraperPath = join('scrapers', 'accommodation_scraper.py');

      // First try Selenium scraper
      const pythonProcess = spawn(this.pythonPath, [seleniumScraperPath, url], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: join(__dirname, '..', '..'),
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            console.info('result', result);
            this.logger.log(`Successfully scraped ${url} with Selenium`);
            resolve(result);
          } catch (error) {
            this.logger.error(
              `Failed to parse Selenium scraper output: ${error instanceof Error ? error.message : String(error)}`,
            );
            // Fall back to basic scraper
            this.tryBasicScraper(url, resolve);
          }
        } else {
          this.logger.warn(
            `Selenium scraper failed with code ${code}: ${stderr}. Trying basic scraper...`,
          );
          // Fall back to basic scraper
          this.tryBasicScraper(url, resolve);
        }
      });

      pythonProcess.on('error', (error) => {
        this.logger.error(
          `Failed to start Selenium scraper: ${error instanceof Error ? error.message : String(error)}`,
        );
        // Fall back to basic scraper
        this.tryBasicScraper(url, resolve);
      });

      // Set timeout to prevent hanging
      setTimeout(() => {
        pythonProcess.kill();
        this.logger.warn(`Python scraper timeout for ${url}`);
        resolve(this.createFallbackResponse(url));
      }, 30000); // 30 second timeout
    });
  }

  private findPythonExecutable(): string | null {
    const possiblePaths = [
      'python3',
      'python',
      '/usr/bin/python3',
      '/usr/bin/python',
      '/usr/local/bin/python3',
      '/usr/local/bin/python',
    ];

    for (const path of possiblePaths) {
      try {
        const { execSync } = require('child_process');
        execSync(`${path} --version`, { stdio: 'ignore' });
        return path;
      } catch (error) {
        // Continue to next path
      }
    }

    return null;
  }

  private createFallbackResponse(url: string): ParsedAccommodationData {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();

      let platformName = 'External Site';
      if (domain.includes('airbnb.com')) platformName = 'Airbnb';
      else if (domain.includes('booking.com')) platformName = 'Booking.com';
      else if (domain.includes('hostelworld.com')) platformName = 'Hostelworld';
      else if (domain.includes('hotels.com')) platformName = 'Hotels.com';
      else if (domain.includes('expedia.com')) platformName = 'Expedia';
      else if (domain.includes('tripadvisor.com')) platformName = 'TripAdvisor';

      return {
        name: `${platformName} Property`,
        description: `Property found on ${platformName}. Please fill in the details manually.`,
        address: 'Address not available - please fill in manually',
        contactInfo: 'Contact information not available',
        priceRange: 'Price range not available',
        imagesUrl: url,
        sourceUrl: url,
      };
    } catch (error) {
      return {
        name: 'Unknown Property',
        description:
          'Failed to extract data. Please fill in the details manually.',
        address: 'Address not available - please fill in manually',
        contactInfo: 'Contact information not available',
        priceRange: 'Price range not available',
        imagesUrl: url,
        sourceUrl: url,
      };
    }
  }

  private tryBasicScraper(
    url: string,
    resolve: (value: ParsedAccommodationData) => void,
  ): void {
    const basicScraperPath = join('scrapers', 'accommodation_scraper.py');
    const basicProcess = spawn(this.pythonPath, [basicScraperPath, url], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: join(__dirname, '..', '..'),
    });

    let stdout = '';
    let stderr = '';

    basicProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    basicProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    basicProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          this.logger.log(`Successfully scraped ${url} with basic scraper`);
          resolve(result);
        } catch (error) {
          this.logger.error(
            `Failed to parse basic scraper output: ${error instanceof Error ? error.message : String(error)}`,
          );
          resolve(this.createFallbackResponse(url));
        }
      } else {
        this.logger.error(`Basic scraper failed with code ${code}: ${stderr}`);
        resolve(this.createFallbackResponse(url));
      }
    });

    basicProcess.on('error', (error) => {
      this.logger.error(
        `Failed to start basic scraper: ${error instanceof Error ? error.message : String(error)}`,
      );
      resolve(this.createFallbackResponse(url));
    });

    // Set timeout for basic scraper
    setTimeout(() => {
      basicProcess.kill();
      this.logger.warn(`Basic scraper timeout for ${url}`);
      resolve(this.createFallbackResponse(url));
    }, 15000); // 15 second timeout for basic scraper
  }
}
