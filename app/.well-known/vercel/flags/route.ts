import { NextResponse } from "next/server";
import { verifyAccess, type ApiData } from "flags";
import { flags } from "@/lib/flags";

export async function GET(request: Request) {
	const access = await verifyAccess(request.headers.get("Authorization"));

	if (!access) {
		return NextResponse.json(null, { status: 401 });
	}

	const flagsData: ApiData = {
		definitions: Object.fromEntries(
			flags.map((f) => [
				f.key,
				{
					description: f.description,
					options: f.options?.map((opt) => ({
						value: opt.value,
						label: opt.label,
					})),
				},
			])
		),
	};

	return NextResponse.json(flagsData);
}
