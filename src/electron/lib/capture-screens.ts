import { screen, desktopCapturer } from "electron";

export async function captureScreens() {
	const displays = screen.getAllDisplays();
	const dataURLs: string[] = [];

	for (const d of displays) {
		const { width, height } = d.size;
		const sources = await desktopCapturer.getSources({
			types: ["screen"],
			thumbnailSize: {
				width: width,
				height: height,
			},
		});

		if (sources.length === 0) continue;

		const source = sources[0];

		dataURLs.push(source.thumbnail.toDataURL());
	}
	return dataURLs;
}
