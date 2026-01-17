import { db } from "@/db";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const getStats = createServerFn({ method: "GET" }).handler(async () => {
	const authors = await db.count("author", {});
	const books = await db.count("book", {});
	return { authors, books };
});

const getRecentBooks = createServerFn({ method: "GET" }).handler(async () => {
	return db.findMany("book", {
		select: ["id", "title"],
		include: {
			author: {
				select: ["id", "name"],
			},
		},
		orderBy: [["createdAt", "desc"]],
		limit: 5,
	});
});

export const Route = createFileRoute("/")({
	component: Home,
	loader: async () => {
		const [stats, recentBooks] = await Promise.all([
			getStats(),
			getRecentBooks(),
		]);
		return { stats, recentBooks };
	},
});

function Home() {
	const { stats, recentBooks } = Route.useLoaderData();

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold text-gray-900 mb-2">Library</h1>
				<p className="text-gray-600 mb-8">
					A simple demo of{" "}
					<code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm">
						@casekit/orm
					</code>
				</p>

				<div className="grid grid-cols-2 gap-4 mb-8">
					<Link
						to="/authors"
						className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
					>
						<div className="text-3xl font-bold text-blue-600">
							{stats.authors}
						</div>
						<div className="text-gray-600">Authors</div>
					</Link>
					<Link
						to="/books"
						className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
					>
						<div className="text-3xl font-bold text-green-600">
							{stats.books}
						</div>
						<div className="text-gray-600">Books</div>
					</Link>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						Recent Books
					</h2>
					{recentBooks.length === 0 ? (
						<p className="text-gray-500">
							No books yet.{" "}
							<Link
								to="/books/new"
								search={{ authorId: undefined }}
								className="text-blue-600 hover:underline"
							>
								Add one
							</Link>
						</p>
					) : (
						<ul className="divide-y divide-gray-100">
							{recentBooks.map((book) => (
								<li
									key={book.id}
									className="py-3 flex justify-between items-center"
								>
									<div>
										<Link
											to="/books/$bookId"
											params={{ bookId: String(book.id) }}
											className="font-medium text-gray-900 hover:text-blue-600"
										>
											{book.title}
										</Link>
										<span className="text-gray-500 ml-2">
											by{" "}
											<Link
												to="/authors/$authorId"
												params={{
													authorId: String(book.author.id),
												}}
												className="hover:text-blue-600"
											>
												{book.author.name}
											</Link>
										</span>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}
