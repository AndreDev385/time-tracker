import * as React from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

type DropdownCardProps = {
	title: string;
	className?: string;
	children: React.ReactNode[];
};

export function DropdownCard({
	title,
	className,
	children,
}: DropdownCardProps) {
	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<div
			className={cn(
				"w-full rounded-lg border bg-card text-card-foreground shadow-sm transition-all",
				isOpen ? "shadow-md" : "",
				className,
			)}
		>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex w-full items-center justify-between p-4 hover:bg-muted/50 rounded-lg"
			>
				<h3 className="text-sm font-medium">{title}</h3>
				<ChevronDown
					className={cn(
						"h-5 w-5 transition-transform duration-200",
						isOpen ? "rotate-180" : "",
					)}
				/>
			</button>
			{/*
      <CollapsibleContent className="animate-accordion-down overflow-hidden duration-300">
        <div className="p-4 pt-0 space-y-2">
          {children}
        </div>
      </CollapsibleContent>
      */}
			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{
							height: "auto",
							opacity: 1,
							transition: {
								height: {
									duration: 0.3,
									ease: "easeOut",
								},
								opacity: {
									duration: 0.2,
									delay: 0.1,
								},
							},
						}}
						exit={{
							height: 0,
							opacity: 0,
							transition: {
								height: {
									duration: 0.3,
									ease: "easeIn",
								},
								opacity: {
									duration: 0.2,
								},
							},
						}}
						className="overflow-hidden"
					>
						<motion.div
							initial={{ y: -10 }}
							animate={{ y: 0 }}
							exit={{ y: -10 }}
							transition={{ duration: 0.3, ease: "easeOut" }}
						>
							{children.map((item, index) => (
								<motion.div
									key={`${item?.toString()}-${index}`}
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -10 }}
									transition={{ duration: 0.2 }}
									className="hover:bg-muted"
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									{item}
								</motion.div>
							))}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
