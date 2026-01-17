import { db } from "@/db";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const getAuthors = createServerFn({ method: "GET" }).handler(async () => {
	return await db.findMany("author", {
		select: ["id", "name"],
		include: {
			books: {
				select: ["id"],
			},
		},
		orderBy: ["name"],
	});
});

export const Route = createFileRoute("/authors/")({
	component: Authors,
	loader: () => getAuthors(),
});

function Authors() {
	const authors = Route.useLoaderData();

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Authors</h1>
					<Link
						to="/authors/new"
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
					>
						Add Author
					</Link>
				</div>

				{authors.length === 0 ? (
					<div className="bg-white rounded-lg shadow p-8 text-center">
						<p className="text-gray-500">No authors yet.</p>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow divide-y divide-gray-100">
						{authors.map((author) => (
							<Link
								key={author.id}
								to="/authors/$authorId"
								params={{ authorId: String(author.id) }}
								className="block p-4 hover:bg-gray-50 transition-colors"
							>
								<div className="font-medium text-gray-900">{author.name}</div>
								<div className="text-sm text-gray-500">
									{author.books.length} book
									{author.books.length !== 1 ? "s" : ""}
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
