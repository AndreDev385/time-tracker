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

		const source = sources.find(
			({ display_id }) => display_id === String(d.id),
		);
		if (!source) {
			continue;
		}
		dataURLs.push(source.thumbnail.toDataURL());
	}
	return dataURLs;
}
