#!/usr/bin/env python3
"""
Enhanced Airbnb Scraper using pyairbnb library
Extracts detailed information from Airbnb listings using the pyairbnb library
"""

import json
import re
import sys
import urllib.parse
from typing import Any, Dict, List, Optional

import pyairbnb


class AirbnbScraper:
    def __init__(self):
        """Initialize the Airbnb scraper with pyairbnb library"""
        pass

    def scrape_accommodation(self, url: str) -> Dict[str, str]:
        """Main method to scrape Airbnb accommodation data from URL"""
        try:
            # Parse URL to extract room ID if needed
            room_id = self._extract_room_id(url)
            if not room_id:
                return self._create_fallback_response(
                    url, "Airbnb", "Invalid Airbnb URL format"
                )

            # Extract basic details first
            basic_data = self._get_basic_details(url, room_id)

            # Try to get price information if possible
            price_data = self._get_price_info(url, room_id)

            # Combine the data
            result = self._combine_data(basic_data, price_data, url)

            return result

        except Exception as e:
            return self._create_fallback_response(url, "Airbnb", str(e))

    def _extract_room_id(self, url: str) -> Optional[str]:
        """Extract room ID from Airbnb URL"""
        try:
            # Pattern to match Airbnb room URLs
            patterns = [
                r"/rooms/(\d+)",
                r"/rooms_availability/(\d+)",
                r"/rooms/(\d+)/",
            ]

            for pattern in patterns:
                match = re.search(pattern, url)
                if match:
                    return match.group(1)

            return None
        except Exception:
            return None

    def _get_basic_details(self, url: str, room_id: str) -> Dict[str, Any]:
        """Get basic listing details using pyairbnb"""
        try:
            # Get basic details without price (no check-in/check-out dates)
            data = pyairbnb.get_details(
                room_id=int(room_id), currency="EUR", language="fr"
            )
            return data
        except Exception as e:
            print(f"Error getting basic details: {e}")
            return {}

    def _get_price_info(self, url: str, room_id: str) -> Dict[str, Any]:
        """Try to get price information if possible"""
        try:
            # For price info, we need check-in/check-out dates
            # Since we don't have specific dates, we'll skip price extraction
            # and just return empty dict
            return {}
        except Exception as e:
            print(f"Error getting price info: {e}")
            return {}

    def _combine_data(
        self, basic_data: Dict[str, Any], price_data: Dict[str, Any], url: str
    ) -> Dict[str, str]:
        """Combine basic and price data into our standard format"""
        try:
            # Extract name
            name = self._extract_nested_value(
                basic_data, ["name", "title", "listing_name"]
            )

            # Extract description
            description = self._extract_nested_value(
                basic_data, ["description", "summary", "about"]
            )

            # Extract address
            address = self._extract_address(basic_data)

            # Extract price range
            price_range = self._extract_price_range(basic_data, price_data)

            # Extract images
            images = self._extract_images(basic_data)

            # Extract contact info
            contact_info = self._extract_contact_info(basic_data)

            return {
                "name": name or "Airbnb Property",
                "description": description
                or "Property found on Airbnb. Please fill in the details manually.",
                "address": address or "Address not available - please fill in manually",
                "contactInfo": contact_info or "Contact information not available",
                "priceRange": price_range or "Price range not available",
                "imagesUrl": ",".join(images[:5]) if images else url,
                "sourceUrl": url,
            }

        except Exception as e:
            return self._create_fallback_response(
                url, "Airbnb", f"Error combining data: {str(e)}"
            )

    def _extract_nested_value(
        self, data: Dict[str, Any], keys: List[str]
    ) -> Optional[str]:
        """Extract value from nested dictionary using multiple possible keys"""
        for key in keys:
            try:
                if key in data and data[key]:
                    value = str(data[key]).strip()
                    if value and len(value) > 3:
                        return value
            except Exception:
                continue
        return None

    def _extract_address(self, data: Dict[str, Any]) -> Optional[str]:
        """Extract address information from the data"""
        try:
            # Try different address fields
            address_fields = ["address", "location", "neighborhood", "city", "country"]

            address_parts = []
            for field in address_fields:
                if field in data and data[field]:
                    if isinstance(data[field], str):
                        address_parts.append(data[field].strip())
                    elif isinstance(data[field], dict):
                        # If it's a nested object, try to extract text
                        for sub_key, sub_value in data[field].items():
                            if isinstance(sub_value, str) and sub_value.strip():
                                address_parts.append(sub_value.strip())

            if address_parts:
                return ", ".join(address_parts)

            return None
        except Exception:
            return None

    def _extract_price_range(
        self, basic_data: Dict[str, Any], price_data: Dict[str, Any]
    ) -> Optional[str]:
        """Extract price range information"""
        try:
            # Try to get price from basic data
            price_fields = ["price", "rate", "cost", "amount"]

            for field in price_fields:
                if field in basic_data and basic_data[field]:
                    price = str(basic_data[field]).strip()
                    if price and price != "0":
                        return f"${price}" if not price.startswith("$") else price

            # Try to get price from price data
            if price_data:
                for field in price_fields:
                    if field in price_data and price_data[field]:
                        price = str(price_data[field]).strip()
                        if price and price != "0":
                            return f"${price}" if not price.startswith("$") else price

            return None
        except Exception:
            return None

    def _extract_images(self, data: Dict[str, Any]) -> List[str]:
        """Extract image URLs from the data"""
        try:
            images = []

            # Try different image fields
            image_fields = ["images", "photos", "pictures", "gallery"]

            for field in image_fields:
                if field in data and data[field]:
                    if isinstance(data[field], list):
                        for item in data[field]:
                            if isinstance(item, str) and self._is_valid_image_url(item):
                                images.append(item)
                            elif isinstance(item, dict):
                                # Try to extract URL from nested object
                                for url_key in ["url", "src", "image_url", "photo_url"]:
                                    if url_key in item and isinstance(
                                        item[url_key], str
                                    ):
                                        if self._is_valid_image_url(item[url_key]):
                                            images.append(item[url_key])
                                            break

            return images[:10]  # Limit to 10 images
        except Exception:
            return []

    def _extract_contact_info(self, data: Dict[str, Any]) -> Optional[str]:
        """Extract contact information"""
        try:
            # Try to get host information
            host_fields = ["host", "owner", "contact"]

            for field in host_fields:
                if field in data and data[field]:
                    if isinstance(data[field], dict):
                        host_info = data[field]
                        contact_parts = []

                        # Try to extract name and contact info
                        for contact_key in ["name", "email", "phone", "contact_info"]:
                            if contact_key in host_info and host_info[contact_key]:
                                contact_parts.append(
                                    f"{contact_key}: {host_info[contact_key]}"
                                )

                        if contact_parts:
                            return "; ".join(contact_parts)

            return None
        except Exception:
            return None

    def _is_valid_image_url(self, url: str) -> bool:
        """Check if URL is a valid image URL"""
        try:
            if not url or not isinstance(url, str):
                return False

            # Check if it's an image extension
            if any(
                url.lower().endswith(ext)
                for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]
            ):
                return True

            # Check if it contains image-related keywords
            if any(
                keyword in url.lower()
                for keyword in ["image", "photo", "picture", "gallery"]
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
        print("Usage: python airbnb_scraper.py <airbnb_url>")
        sys.exit(1)

    url = sys.argv[1]
    scraper = AirbnbScraper()
    result = scraper.scrape_accommodation(url)

    # Output as JSON
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
