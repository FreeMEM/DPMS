#!/usr/bin/env python3
"""
Scrape all Posadas Party productions from Demozoo API.

Usage:
    python scripts/scrape_demozoo.py

Output:
    scripts/posadas_all_editions.json

Fetches party data, then each production's details (screenshots, videos, links).
Respects rate limits with delays between requests.
"""

import json
import time
import sys
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

API_BASE = "https://demozoo.org/api/v1"
USER_AGENT = "DPMS/1.0 (Posadas Party Management System)"

# All Posadas Party editions in Demozoo
POSADAS_EDITIONS = {
    718: "Posadas 1995",
    3205: "Posadas 2017",
    3650: "Posadas 2018",
    3875: "Posadas 2019",
    4485: "Posadas 2022",
    4583: "Posadas 2022 Autumn Edition",
    4674: "Posadas 2023",
    5061: "Posadas 2024",
    5065: "Posadas 2025",
    # 5519: Posadas 2026 - upcoming, no productions yet
}


def api_get(url, retries=3, delay=1.0):
    """Fetch JSON from Demozoo API with retries and rate limiting."""
    for attempt in range(retries):
        try:
            req = Request(url, headers={"User-Agent": USER_AGENT})
            with urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            time.sleep(delay)  # Rate limiting
            return data
        except (URLError, HTTPError) as e:
            print(f"  [RETRY {attempt + 1}/{retries}] {url}: {e}")
            time.sleep(delay * (attempt + 1))
    print(f"  [FAILED] {url}")
    return None


def fetch_production_details(production_id):
    """Fetch full production details including screenshots and links."""
    url = f"{API_BASE}/productions/{production_id}/?format=json"
    data = api_get(url, delay=0.5)
    if not data:
        return None

    # Extract relevant fields
    screenshots = []
    for shot in data.get("screenshots", []):
        screenshots.append({
            "original_url": shot.get("original_url"),
            "standard_url": shot.get("standard_url"),
            "thumbnail_url": shot.get("thumbnail_url"),
        })

    download_links = []
    for link in data.get("download_links", []):
        download_links.append({
            "url": link.get("url"),
            "link_class": link.get("link_class"),
        })

    # Extract external links (pouet, youtube, scene.org, etc.)
    external_links = []
    for link in data.get("external_links", []):
        external_links.append({
            "url": link.get("url"),
            "link_class": link.get("link_class"),
        })

    # Extract author names
    authors = []
    for credit in data.get("credits", []):
        nick = credit.get("nick", {})
        if nick and nick.get("name"):
            authors.append(nick["name"])

    # If no credits, try author_nicks and author_affiliation_nicks
    if not authors:
        for nick in data.get("author_nicks", []):
            if nick.get("name"):
                authors.append(nick["name"])
        for nick in data.get("author_affiliation_nicks", []):
            if nick.get("name"):
                authors.append(nick["name"])

    # Extract specific URLs
    youtube_url = None
    pouet_url = None
    scene_org_url = None

    for link in external_links + download_links:
        url_str = link.get("url", "")
        if "youtube.com" in url_str or "youtu.be" in url_str:
            youtube_url = url_str
        elif "pouet.net" in url_str:
            pouet_url = url_str
        elif "scene.org" in url_str:
            scene_org_url = url_str

    # Platforms
    platforms = [p.get("name", "") for p in data.get("platforms", [])]

    # Types (demo, intro, music, etc.)
    types = [t.get("name", "") for t in data.get("types", [])]

    return {
        "demozoo_id": data.get("id"),
        "title": data.get("title"),
        "authors": authors,
        "platforms": platforms,
        "types": types,
        "release_date": data.get("release_date"),
        "screenshots": screenshots,
        "download_links": download_links,
        "external_links": external_links,
        "youtube_url": youtube_url,
        "pouet_url": pouet_url,
        "scene_org_url": scene_org_url,
    }


def fetch_party_data(party_id, party_name):
    """Fetch all competitions and productions for a party edition."""
    print(f"\n{'='*60}")
    print(f"Fetching: {party_name} (ID: {party_id})")
    print(f"{'='*60}")

    url = f"{API_BASE}/parties/{party_id}/?format=json"
    party_data = api_get(url)
    if not party_data:
        print(f"  Failed to fetch party data for {party_name}")
        return None

    edition = {
        "demozoo_party_id": party_id,
        "name": party_data.get("name", party_name),
        "start_date": party_data.get("start_date"),
        "end_date": party_data.get("end_date"),
        "location": party_data.get("location"),
        "website": party_data.get("website"),
        "competitions": [],
    }

    competitions = party_data.get("competitions", [])
    print(f"  Found {len(competitions)} competitions")

    for comp in competitions:
        comp_name = comp.get("name", "Unknown")
        placings = comp.get("results", []) or comp.get("placings", [])
        print(f"  - {comp_name}: {len(placings)} productions")

        competition = {
            "name": comp_name,
            "shown_date": comp.get("shown_date"),
            "platform": comp.get("platform"),
            "production_type": comp.get("production_type"),
            "productions": [],
        }

        for placing in placings:
            prod_data = placing.get("production", {})
            prod_id = prod_data.get("id")
            position = placing.get("position")
            ranking = placing.get("ranking")
            score = placing.get("score")

            if not prod_id:
                continue

            print(f"    Fetching production {prod_id}: {prod_data.get('title', '?')}...")
            details = fetch_production_details(prod_id)

            if details:
                details["position"] = position
                details["ranking"] = ranking
                details["score"] = score
                details["competition"] = comp_name
                competition["productions"].append(details)
            else:
                # Fallback with basic data
                competition["productions"].append({
                    "demozoo_id": prod_id,
                    "title": prod_data.get("title", "Unknown"),
                    "authors": [],
                    "platforms": [],
                    "types": [],
                    "release_date": None,
                    "screenshots": [],
                    "download_links": [],
                    "external_links": [],
                    "youtube_url": None,
                    "pouet_url": None,
                    "scene_org_url": None,
                    "position": position,
                    "ranking": ranking,
                    "score": score,
                    "competition": comp_name,
                })

        edition["competitions"].append(competition)

    total_prods = sum(len(c["productions"]) for c in edition["competitions"])
    print(f"  Total productions fetched: {total_prods}")

    return edition


def main():
    print("Demozoo Scraper - Posadas Party All Editions")
    print(f"Editions to fetch: {len(POSADAS_EDITIONS)}")

    all_editions = []

    for party_id, party_name in POSADAS_EDITIONS.items():
        edition = fetch_party_data(party_id, party_name)
        if edition:
            all_editions.append(edition)

    # Save to JSON
    output_file = "scripts/posadas_all_editions.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_editions, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*60}")
    print(f"Done! Saved {len(all_editions)} editions to {output_file}")
    total = sum(
        sum(len(c["productions"]) for c in e["competitions"])
        for e in all_editions
    )
    print(f"Total productions: {total}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
