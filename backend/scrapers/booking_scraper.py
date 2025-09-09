#!/usr/bin/env python3
"""
Enhanced Booking.com Scraper using Selenium
Extracts detailed information from Booking.com listings using Selenium WebDriver
Based on techniques from: https://github.com/ALeterouin/booking-hotel-scraper
"""

import json
import re
import sys
import time
import urllib.parse
from typing import Any, Dict, List, Optional

import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager


class BookingScraper:
    def __init__(self, headless: bool = True):
        """Initialize the Booking.com scraper with Selenium WebDriver"""
        self.headless = headless
        self.driver = None

    def _setup_driver(self):
        """Setup Chrome WebDriver with enhanced anti-detection measures"""
        try:
            chrome_options = Options()

            if self.headless:
                chrome_options.add_argument("--headless=new")  # Use new headless mode

            # Enhanced anti-detection options
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-blink-features=AutomationControlled")
            chrome_options.add_argument("--disable-web-security")
            chrome_options.add_argument("--allow-running-insecure-content")
            chrome_options.add_argument("--disable-extensions")
            chrome_options.add_argument("--disable-plugins")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--disable-features=VizDisplayCompositor")
            chrome_options.add_argument("--window-size=1920,1080")
            chrome_options.add_argument("--disable-background-timer-throttling")
            chrome_options.add_argument("--disable-renderer-backgrounding")
            chrome_options.add_argument("--disable-backgrounding-occluded-windows")

            # Remove automation indicators
            chrome_options.add_experimental_option(
                "excludeSwitches", ["enable-automation"]
            )
            chrome_options.add_experimental_option("useAutomationExtension", False)
            chrome_options.add_argument("--disable-blink-features=AutomationControlled")

            # Use a realistic user agent
            chrome_options.add_argument(
                "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )

            # Setup ChromeDriver
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)

            # Execute multiple anti-detection scripts
            self.driver.execute_script(
                "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
            )
            self.driver.execute_script(
                "Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]})"
            )
            self.driver.execute_script(
                "Object.defineProperty(navigator, 'languages', {get: () => ['fr-FR', 'fr']})"
            )
            self.driver.execute_script("window.chrome = {runtime: {}}")

            return True
        except Exception as e:
            print(f"Error setting up WebDriver: {e}")
            return False

    def scrape_accommodation(self, url: str) -> Dict[str, str]:
        """Main method to scrape Booking.com accommodation data from URL"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                if not self._setup_driver():
                    return self._create_fallback_response(
                        url, "Booking.com", "Failed to setup WebDriver"
                    )

                # Navigate to the URL with French language preference
                if "booking.com" in url:
                    # Add language parameter to force French
                    if "?" in url:
                        url += "&lang=fr"
                    else:
                        url += "?lang=fr"

                self.driver.get(url)

                # Wait for page to load with better detection
                time.sleep(3)

                # Check if we got a "Javascript disabled" or similar error
                page_source = self.driver.page_source.lower()
                if any(
                    error in page_source
                    for error in [
                        "javascript disabled",
                        "enable javascript",
                        "js disabled",
                    ]
                ):
                    print(f"Attempt {attempt + 1}: JavaScript disabled error detected")
                    if attempt < max_retries - 1:
                        self.driver.quit()
                        time.sleep(2)  # Wait before retry
                        continue
                    else:
                        return self._create_fallback_response(
                            url,
                            "Booking.com",
                            "JavaScript disabled error after multiple attempts",
                        )

                # Wait for specific elements to load
                try:
                    WebDriverWait(self.driver, 10).until(
                        lambda driver: driver.execute_script(
                            "return document.readyState"
                        )
                        == "complete"
                    )
                except TimeoutException:
                    print(
                        f"Attempt {attempt + 1}: Page load timeout, but continuing..."
                    )

                # Extract hotel data
                result = self._extract_hotel_data(url)

                # Check if we got meaningful data
                if result.get("name") and result.get("name") != "Booking.com Property":
                    return result
                elif attempt < max_retries - 1:
                    self.driver.quit()
                    time.sleep(2)
                    continue
                else:
                    return result

            except Exception as e:
                print(f"Attempt {attempt + 1}: Error occurred: {e}")
                if attempt < max_retries - 1:
                    if self.driver:
                        self.driver.quit()
                    time.sleep(2)
                    continue
                else:
                    return self._create_fallback_response(url, "Booking.com", str(e))
            finally:
                if self.driver:
                    self.driver.quit()

        # If all Selenium attempts failed, try with requests as fallback
        print("All Selenium attempts failed, trying requests fallback...")
        return self._scrape_with_requests(url)

    def _scrape_with_requests(self, url: str) -> Dict[str, str]:
        """Fallback method using requests when Selenium fails"""
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "fr-FR,fr;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
            }

            # Add language parameter
            if "?" in url:
                url += "&lang=fr"
            else:
                url += "?lang=fr"

            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "html.parser")

            # Extract data using BeautifulSoup
            name = self._extract_name_requests(soup)
            description = self._extract_description_requests(soup)
            address = self._extract_address_requests(soup)
            price_range = self._extract_price_requests(soup)
            images = self._extract_images_requests(soup)

            return {
                "name": name or "Booking.com Property",
                "description": description
                or "Property found on Booking.com. Please fill in the details manually.",
                "address": address or "Address not available - please fill in manually",
                "contactInfo": "Contact information not available",
                "priceRange": price_range or "Price range not available",
                "imagesUrl": ",".join(images[:5]) if images else url,
                "sourceUrl": url,
            }

        except Exception as e:
            return self._create_fallback_response(
                url, "Booking.com", f"Requests fallback failed: {str(e)}"
            )

    def _extract_name_requests(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract hotel name using requests/BeautifulSoup"""
        selectors = [
            "h2#hp_hotel_name",
            ".hp__hotel_name",
            'h1[data-testid="hotel-name"]',
            ".pp-header__title",
            "h1",
            ".property-name",
        ]

        for selector in selectors:
            element = soup.select_one(selector)
            if element and element.get_text(strip=True):
                name = element.get_text(strip=True)
                name = re.sub(r"\s+", " ", name)
                name = re.sub(
                    r"^(Offre à l'établissement|Hotel|Hôtel)\s*",
                    "",
                    name,
                    flags=re.IGNORECASE,
                )
                if len(name) > 3:
                    return name
        return None

    def _extract_description_requests(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract description using requests/BeautifulSoup"""
        selectors = [
            "#property_description_content",
            ".property_description",
            '[data-testid="property-description"]',
            ".hp__hotel_description",
            ".description",
        ]

        for selector in selectors:
            element = soup.select_one(selector)
            if element and element.get_text(strip=True):
                description = element.get_text(strip=True)
                description = re.sub(r"\s+", " ", description)
                if len(description) > 10:
                    return description
        return None

    def _extract_address_requests(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract address using requests/BeautifulSoup"""
        selectors = [
            ".hp_address_subtitle",
            '[data-testid="address"]',
            ".address",
            ".location",
        ]

        for selector in selectors:
            element = soup.select_one(selector)
            if element and element.get_text(strip=True):
                return element.get_text(strip=True)
        return None

    def _extract_price_requests(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract price using requests/BeautifulSoup"""
        selectors = [
            "div[data-et-mouseenter='goal:desktop_room_list_price_column_hover_over_price']",
            ".prco-valign-middle-helper",
            ".bui-price-display__value",
            '[data-testid="price"]',
            ".price",
        ]

        for selector in selectors:
            element = soup.select_one(selector)
            if element and element.get_text(strip=True):
                return element.get_text(strip=True)
        return None

    def _extract_images_requests(self, soup: BeautifulSoup) -> List[str]:
        """Extract images using requests/BeautifulSoup"""
        images = []
        selectors = [
            ".hp_gallery img",
            '[data-testid="gallery-image"]',
            ".gallery img",
            ".photos img",
        ]

        for selector in selectors:
            elements = soup.select(selector)
            for element in elements:
                src = element.get("src") or element.get("data-src")
                if src and self._is_valid_image_url(src):
                    if src.startswith("//"):
                        src = "https:" + src
                    elif src.startswith("/"):
                        src = urllib.parse.urljoin("https://www.booking.com", src)
                    elif not src.startswith("http"):
                        continue
                    images.append(src)

        return list(dict.fromkeys(images))[:10]

    def _extract_hotel_data(self, url: str) -> Dict[str, str]:
        """Extract hotel data from the Booking.com page"""
        try:
            # Wait for the page to load
            wait = WebDriverWait(self.driver, 10)

            # Extract hotel name
            name = self._extract_hotel_name()

            # Extract description
            description = self._extract_description()

            # Extract address
            address = self._extract_address()

            # Extract price range
            price_range = self._extract_price()

            # Extract images
            images = self._extract_images()

            # Extract contact info
            contact_info = self._extract_contact_info()

            return {
                "name": name or "Booking.com Property",
                "description": description
                or "Property found on Booking.com. Please fill in the details manually.",
                "address": address or "Address not available - please fill in manually",
                "contactInfo": contact_info or "Contact information not available",
                "priceRange": price_range or "Price range not available",
                "imagesUrl": ",".join(images[:5]) if images else url,
                "sourceUrl": url,
            }

        except Exception as e:
            return self._create_fallback_response(
                url, "Booking.com", f"Error extracting data: {str(e)}"
            )

    def _extract_hotel_name(self) -> Optional[str]:
        """Extract hotel name from the page"""
        try:
            selectors = [
                ".pp-header__title",
                "h2#hp_hotel_name",
                ".hp__hotel_name",
                'h1[data-testid="hotel-name"]',
                'h1[data-testid="property-name"]',
                ".hp__hotel_name h1",
                "h1",
                ".property-name",
                ".hotel-name",
                ".hp__hotel_name h2",
                "[data-testid='hotel-name']",
                ".property-title",
                ".hotel-title",
                ".bui-spacer--larger h1",
                ".bui-spacer--larger h2",
            ]

            for selector in selectors:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element and element.text.strip():
                        name = element.text.strip()
                        # Clean up the name
                        name = re.sub(r"\s+", " ", name)
                        # Remove common prefixes/suffixes
                        name = re.sub(
                            r"^(Offre à l'établissement|Hotel|Hôtel)\s*",
                            "",
                            name,
                            flags=re.IGNORECASE,
                        )
                        name = re.sub(
                            r"\s*\(.*?\)\s*$", "", name
                        )  # Remove trailing parentheses
                        if len(name) > 3:  # Only return if meaningful
                            return name
                except NoSuchElementException:
                    continue

            return None
        except Exception:
            return None

    def _extract_description(self) -> Optional[str]:
        """Extract hotel description from the page"""
        try:
            selectors = [
                "#property_description_content",
                ".property_description",
                '[data-testid="property-description"]',
                ".hp__hotel_description",
                ".property_description_content",
                ".description",
                ".hotel-description",
                ".property-about",
            ]

            for selector in selectors:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element and element.text.strip():
                        # Clean up the description
                        description = element.text.strip()
                        # Remove excessive whitespace
                        description = re.sub(r"\s+", " ", description)
                        return description
                except NoSuchElementException:
                    continue

            return None
        except Exception:
            return None

    def _extract_address(self) -> Optional[str]:
        """Extract hotel address from the page"""
        try:
            selectors = [
                'div[data-testid="PropertyHeaderAddressDesktop-wrapper"] > button div:nth-child(1)',
                'div[data-testid="PropertyHeaderAddressDesktop-wrapper"] button didiv:nth-child(1)',
                '[data-testid="PropertyHeaderAddressDesktop-wrapper"] button div:nth-child(1)',
            ]

            for selector in selectors:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element and element.text.strip():
                        return element.text.strip().split("\n")[0]
                except NoSuchElementException:
                    continue

            return None
        except Exception:
            return None

    def _extract_price(self) -> Optional[str]:
        """Extract price information from the page"""
        try:
            selectors = [
                "div[data-et-mouseenter='goal:desktop_room_list_price_column_hover_over_price']",
                ".prco-valign-middle-helper",
                ".bui-price-display__value",
                '[data-testid="price"]',
                ".hp__hotel_price",
                ".price",
                ".hotel-price",
                ".property-price",
                ".rate",
            ]

            for selector in selectors:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element and element.text.strip():
                        price_text = element.text.strip()
                        # Clean up price text
                        price_text = re.sub(r"\s+", " ", price_text)
                        return price_text
                except NoSuchElementException:
                    continue

            return None
        except Exception:
            return None

    def _extract_images(self) -> List[str]:
        """Extract image URLs from the page"""
        try:
            images = []

            selectors = [
                ".hp_gallery img",
                '[data-testid="gallery-image"]',
                ".gallery img",
                ".photos img",
                ".hotel-gallery img",
                ".property-gallery img",
                'img[data-testid="image"]',
                "#photo_wrapper img",
            ]

            for selector in selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    for element in elements:
                        try:
                            src = element.get_attribute("src") or element.get_attribute(
                                "data-src"
                            )
                            if src and self._is_valid_image_url(src):
                                # Convert relative URLs to absolute
                                if src.startswith("//"):
                                    src = "https:" + src
                                elif src.startswith("/"):
                                    src = urllib.parse.urljoin(
                                        self.driver.current_url, src
                                    )
                                elif not src.startswith("http"):
                                    continue

                                images.append(src)
                        except Exception:
                            continue
                except NoSuchElementException:
                    continue

            # Remove duplicates and return unique images
            return list(dict.fromkeys(images))[:10]  # Limit to 10 images
        except Exception:
            return []

    def _extract_contact_info(self) -> Optional[str]:
        """Extract contact information from the page"""
        try:
            selectors = [
                '[data-testid="hotel-contact"]',
                ".hotel-contact",
                '[data-testid="hotel-info"]',
                ".hp__hotel_contact",
                ".contact-info",
                ".property-contact",
            ]

            for selector in selectors:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element and element.text.strip():
                        return element.text.strip()
                except NoSuchElementException:
                    continue

            return None
        except Exception:
            return None

    def _is_valid_image_url(self, url: str) -> bool:
        """Check if URL is a valid image URL"""
        try:
            if not url or not isinstance(url, str):
                return False

            # Filter out common non-image patterns
            invalid_patterns = [
                "icon",
                "logo",
                "avatar",
                "thumbnail",
                "placeholder",
                "loading",
                "spinner",
                "banner",
                "ad",
                "advertisement",
            ]

            if any(pattern in url.lower() for pattern in invalid_patterns):
                return False

            # Check if it's an image extension
            if any(
                url.lower().endswith(ext)
                for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]
            ):
                return True

            # Check if it contains image-related keywords
            if any(
                keyword in url.lower()
                for keyword in ["image", "photo", "picture", "gallery", "media"]
            ):
                return True

            # Check for common image URL patterns
            if any(
                pattern in url.lower()
                for pattern in ["/images/", "/photos/", "/media/", "/gallery/"]
            ):
                return True

            return False
        except Exception:
            return False

    def _create_fallback_response(
        self, url: str, platform: str, error: str
    ) -> Dict[str, str]:
        """Create fallback response when scraping fails"""
        return {
            "name": f"{platform} Property",
            "description": f"Property found on {platform}. Please fill in the details manually. Error: {error}",
            "address": "Address not available - please fill in manually",
            "contactInfo": "Contact information not available",
            "priceRange": "Price range not available",
            "imagesUrl": url,
            "sourceUrl": url,
        }


def main():
    """Main function for command line usage"""
    if len(sys.argv) != 2:
        print("Usage: python booking_scraper.py <booking_url>")
        sys.exit(1)

    url = sys.argv[1]
    scraper = BookingScraper(headless=True)
    result = scraper.scrape_accommodation(url)

    # Output as JSON
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
