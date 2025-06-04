export function Step({ options, setSelected, message }: StepProps) {
	return (
		<div className="flex flex-wrap flex-row gap-2 w-full items-center">
			{options.length === 0 ? (
				<span className="text-sm">{message}</span>
			) : (
				options.map((v) => (
					<p
						key={v.id}
						onMouseDown={() => setSelected(v.id)}
						className="hover:underline hover:cursor-pointer hover:font-bold text-sm"
					>
						{v.name}
					</p>
				))
			)}
		</div>
	);
}

type StepProps = {
	message: string;
	options: { id: string; name: string }[];
	setSelected: (id: string) => void;
};
