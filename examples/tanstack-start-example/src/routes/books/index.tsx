import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";

const getBooks = createServerFn({ method: "GET" }).handler(async () => {
	return db.findMany("book", {
		select: ["id", "title"],
		include: {
			author: {
				select: ["id", "name"],
			},
		},
		orderBy: ["title"],
	});
});

export const Route = createFileRoute("/books/")({
	component: Books,
	loader: () => getBooks(),
});

function Books() {
	const books = Route.useLoaderData();

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Books</h1>
					<Link
						to="/books/new"
						search={{ authorId: undefined }}
						className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
					>
						Add Book
					</Link>
				</div>

				{books.length === 0 ? (
					<div className="bg-white rounded-lg shadow p-8 text-center">
						<p className="text-gray-500">No books yet.</p>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow divide-y divide-gray-100">
						{books.map((book) => (
							<Link
								key={book.id}
								to="/books/$bookId"
								params={{ bookId: String(book.id) }}
								className="block p-4 hover:bg-gray-50 transition-colors"
							>
								<div className="font-medium text-gray-900">{book.title}</div>
								<div className="text-sm text-gray-500">
									by {book.author.name}
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
