import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
	width: 32,
	height: 32,
};
export const contentType = "image/png";

export default function Icon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#0f0a1a",
					borderRadius: 6,
				}}
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#a855f7"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
					<path d="m14.5 12.5 2-2" />
					<path d="m11.5 9.5 2-2" />
					<path d="m8.5 6.5 2-2" />
					<path d="m17.5 15.5 2-2" />
				</svg>
			</div>
		),
		{
			...size,
		}
	);
}
