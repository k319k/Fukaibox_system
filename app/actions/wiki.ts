"use server";

import { searchWiki as searchWikiApi, getWikiPageExtract as getWikiPageExtractApi } from "@/lib/wiki-api";

export async function searchWikiAction(query: string) {
    try {
        const results = await searchWikiApi(query);
        return { success: true, data: results };
    } catch (error: any) {
        console.error("Wiki Search Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getWikiPageAction(title: string) {
    try {
        const content = await getWikiPageExtractApi(title);
        return { success: true, data: content };
    } catch (error: any) {
        console.error("Wiki Page Error:", error);
        return { success: false, error: error.message };
    }
}
