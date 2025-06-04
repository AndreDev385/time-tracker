export function mapIntervalsStringToDate(
	intervals: { startAt: string; endAt: string | null }[],
): Interval[] {
	return intervals.map((i: { startAt: string; endAt: string | null }) => ({
		startAt: new Date(i.startAt),
		endAt: i.endAt ? new Date(i.endAt) : null,
	}));
}
