import { Link } from "@tanstack/react-router";
import { Book, Users } from "lucide-react";

export default function Header() {
	return (
		<header className="bg-white shadow-sm border-b border-gray-200">
			<div className="max-w-4xl mx-auto px-4">
				<nav className="flex items-center gap-6 h-14">
					<Link
						to="/"
						className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
					>
						Library
					</Link>
					<div className="flex items-center gap-4">
						<Link
							to="/authors"
							className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
							activeProps={{
								className:
									"flex items-center gap-1.5 text-blue-600 font-medium",
							}}
						>
							<Users size={18} />
							<span>Authors</span>
						</Link>
						<Link
							to="/books"
							className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
							activeProps={{
								className:
									"flex items-center gap-1.5 text-blue-600 font-medium",
							}}
						>
							<Book size={18} />
							<span>Books</span>
						</Link>
					</div>
				</nav>
			</div>
		</header>
	);
}
