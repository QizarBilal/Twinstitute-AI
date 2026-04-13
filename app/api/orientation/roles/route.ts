// app/api/orientation/roles/route.ts
// Get roles and search functionality

import { getAllRoles, getRolesByDomain, searchRoles, getUniqueDomains } from "@/lib/orientation/role-intelligence";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const domain = searchParams.get("domain");
    const action = searchParams.get("action");

    // Get unique domains
    if (action === "domains") {
      return NextResponse.json({
        domains: getUniqueDomains(),
      });
    }

    // Search roles
    if (query) {
      const results = searchRoles(query);
      return NextResponse.json({
        roles: results.map((role) => ({
          id: role.id,
          name: role.name,
          domain: role.domain,
          description: role.description,
          difficulty: role.difficulty,
          demandLevel: role.demandLevel,
          salaryRangeIndia: role.salaryRangeIndia,
        })),
        count: results.length,
      });
    }

    // Get roles by domain
    if (domain) {
      const results = getRolesByDomain(domain);
      return NextResponse.json({
        domain,
        roles: results.map((role) => ({
          id: role.id,
          name: role.name,
          difficulty: role.difficulty,
          demandLevel: role.demandLevel,
          salaryRangeIndia: role.salaryRangeIndia.mid,
        })),
        count: results.length,
      });
    }

    // Return all roles
    const allRoles = getAllRoles();
    return NextResponse.json({
      roles: allRoles.map((role) => ({
        id: role.id,
        name: role.name,
        domain: role.domain,
        subdomain: role.subdomain,
        difficulty: role.difficulty,
        demandLevel: role.demandLevel,
        description: role.description,
        salaryRangeIndia: role.salaryRangeIndia,
        workStyle: role.workStyle,
      })),
      count: allRoles.length,
    });
  } catch (error) {
    console.error("Roles API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
