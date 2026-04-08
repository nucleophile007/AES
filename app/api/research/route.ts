import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 8;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const year = searchParams.get("year") || "";
    const domainsParam = searchParams.get("domains") || "";
    const domains = domainsParam ? domainsParam.split(",").filter(Boolean) : [];
    const category = searchParams.get("category") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const showAll = searchParams.get("showAll") === "true";

    // Build dynamic where clause
    const where: any = {
      published: true,
    };

    // Apply search filter (search across multiple fields)
    if (search.trim()) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } },
        { keywords: { hasSome: [search] } }, // Search in keywords array
      ];
    }

    // Apply category filter
    if (category !== "all") {
      where.category = category;
    }

    // Fetch all research for year extraction and counting
    const allResearch = await prisma.research.findMany({
      where: {
        published: true,
      },
      select: {
        id: true,
        createdAt: true,
        category: true,
        domain: true,
        title: true,
        description: true,
        author: true,
        slug: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Extract unique years from research data
    const years = Array.from(
      new Set(
        allResearch.map((r) => new Date(r.createdAt).getFullYear())
      )
    ).sort((a, b) => b - a); // Descending order (newest first)

    // Filter by year if specified
    let filteredResearch = allResearch;
    if (year && year !== "all") {
      const yearNum = parseInt(year);
      filteredResearch = allResearch.filter(
        (r) => new Date(r.createdAt).getFullYear() === yearNum
      );
    }

    // Calculate domain counts based on year filter (cascading)
    const domainCounts: Record<string, number> = {
      "AI/ML": 0,
      "Pre-Med/BIO/CHEM": 0,
      "Engineering": 0,
      "Law & Political Sciences": 0,
    };
    filteredResearch.forEach((r) => {
      if (r.domain && domainCounts.hasOwnProperty(r.domain)) {
        domainCounts[r.domain]++;
      }
    });

    // Filter by domains if specified (cascading from year)
    if (domains.length > 0) {
      filteredResearch = filteredResearch.filter(
        (r) => r.domain && domains.includes(r.domain)
      );
    }

    // Apply search and category filters for final results
    let finalResults = filteredResearch;
    
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      finalResults = finalResults.filter((r) => {
        return (
          r.title?.toLowerCase().includes(searchLower) ||
          r.description?.toLowerCase().includes(searchLower) ||
          r.author?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (category !== "all") {
      finalResults = finalResults.filter((r) => r.category === category);
    }

    // Calculate counts by category for the selected year
    const categoryCounts = {
      all: finalResults.length,
      IGNITE: finalResults.filter((r) => r.category === "IGNITE").length,
      ELEVATE: finalResults.filter((r) => r.category === "ELEVATE").length,
      TRANSFORM: finalResults.filter((r) => r.category === "TRANSFORM").length,
    };

    // Calculate counts by year
    const yearCounts: Record<string, number> = {};
    years.forEach((y) => {
      const yearResearch = allResearch.filter(
        (r) => new Date(r.createdAt).getFullYear() === y
      );
      yearCounts[y.toString()] = yearResearch.length;
    });

    // Calculate category counts for all years (when year=all)
    const allYearsCategoryCounts = {
      all: allResearch.length,
      IGNITE: allResearch.filter((r) => r.category === "IGNITE").length,
      ELEVATE: allResearch.filter((r) => r.category === "ELEVATE").length,
      TRANSFORM: allResearch.filter((r) => r.category === "TRANSFORM").length,
    };

    // Paginate the final results unless the client requests all filtered rows
    const totalCount = finalResults.length;
    const totalPages = showAll ? 1 : Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const validPage = showAll ? 1 : Math.min(Math.max(1, page), totalPages);
    const resultSet = showAll
      ? finalResults
      : finalResults.slice((validPage - 1) * PAGE_SIZE, (validPage - 1) * PAGE_SIZE + PAGE_SIZE);

    // Fetch full details for selected results
    const fullResearch = await prisma.research.findMany({
      where: {
        id: {
          in: resultSet.map((r) => r.id),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const response = NextResponse.json({
      success: true,
      research: fullResearch,
      totalCount,
      totalPages,
      currentPage: validPage,
      years,
      counts: {
        byCategory: (year && year !== "all") ? categoryCounts : allYearsCategoryCounts,
        byYear: yearCounts,
        byDomain: domainCounts,
      },
    })

    response.headers.set(
      "Cache-Control",
      "public, max-age=300, s-maxage=600, stale-while-revalidate=600"
    )

    return response
  } catch (error) {
    console.error("Error fetching research:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch research" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
