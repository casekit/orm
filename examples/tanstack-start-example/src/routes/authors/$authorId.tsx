import { db } from "@/db";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const getAuthor = createServerFn({ method: "GET" })
	.inputValidator((data: { authorId: number }) => data)
	.handler(async ({ data }) => {
		return db.findOne("author", {
			select: ["id", "name"],
			include: {
				books: {
					select: ["id", "title"],
					orderBy: ["title"],
				},
			},
			where: { id: data.authorId },
		});
	});

const deleteAuthor = createServerFn({ method: "POST" })
	.inputValidator((data: { authorId: number }) => data)
	.handler(async ({ data }) => {
		await db.deleteMany("book", { where: { authorId: data.authorId } });
		return db.deleteOne("author", {
			where: { id: data.authorId },
			returning: ["id"],
		});
	});

export const Route = createFileRoute("/authors/$authorId")({
	component: AuthorDetail,
	loader: ({ params }) =>
		getAuthor({ data: { authorId: Number(params.authorId) } }),
});

function AuthorDetail() {
	const author = Route.useLoaderData();
	const navigate = useNavigate();

	if (!author) {
		return (
			<div className="min-h-screen bg-gray-50 py-12 px-4">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Author not found
					</h1>
					<Link to="/authors" className="text-blue-600 hover:underline">
						Back to authors
					</Link>
				</div>
			</div>
		);
	}

	const handleDelete = async () => {
		if (!confirm("Delete this author and all their books?")) return;
		await deleteAuthor({ data: { authorId: author.id } });
		await navigate({ to: "/authors" });
	};

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-between items-start mb-8">
					<div>
						<Link
							to="/authors"
							className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
						>
							← Back to authors
						</Link>
						<h1 className="text-3xl font-bold text-gray-900">{author.name}</h1>
					</div>
					<button
						type="button"
						onClick={handleDelete}
						className="text-red-600 hover:text-red-700 text-sm"
					>
						Delete
					</button>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-semibold text-gray-900">
							Books ({author.books.length})
						</h2>
						<Link
							to="/books/new"
							search={{ authorId: author.id }}
							className="text-blue-600 hover:underline text-sm"
						>
							Add book
						</Link>
					</div>

					{author.books.length === 0 ? (
						<p className="text-gray-500">No books yet.</p>
					) : (
						<ul className="divide-y divide-gray-100">
							{author.books.map((book) => (
								<li key={book.id} className="py-3">
									<Link
										to="/books/$bookId"
										params={{ bookId: String(book.id) }}
										className="text-gray-900 hover:text-blue-600"
									>
										{book.title}
									</Link>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}
