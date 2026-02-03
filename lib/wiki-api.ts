import { env } from "./env";

const WIKI_API_URL = env.MIRAHEZE_API_URL;
const BOT_USERNAME = env.MIRAHEZE_BOT_USERNAME;
const BOT_PASSWORD = env.MIRAHEZE_BOT_PASSWORD;

/**
 * Wiki Search
 */
export async function searchWiki(query: string, limit: number = 5) {
    const params = new URLSearchParams({
        action: "query",
        list: "search",
        srsearch: query,
        srlimit: limit.toString(),
        format: "json",
        origin: "*", // Enable CORS if client-side, but we usually call this server-side
    });

    const res = await fetch(`${WIKI_API_URL}?${params.toString()}`);
    if (!res.ok) throw new Error("Wiki API request failed");

    const data = await res.json();
    return data.query?.search || [];
}

/**
 * Get Page Content (Extract)
 */
export async function getWikiPageExtract(title: string) {
    const params = new URLSearchParams({
        action: "query",
        prop: "extracts",
        exintro: "true",
        explaintext: "true",
        titles: title,
        format: "json",
    });

    const res = await fetch(`${WIKI_API_URL}?${params.toString()}`);
    const data = await res.json();
    const pages = data.query?.pages;
    const pageId = Object.keys(pages || {})[0];

    if (!pageId || pageId === "-1") return null;
    return pages[pageId].extract;
}
