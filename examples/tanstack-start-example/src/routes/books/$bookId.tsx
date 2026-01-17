import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";

const getBook = createServerFn({ method: "GET" })
	.inputValidator((data: { bookId: number }) => data)
	.handler(async ({ data }) => {
		return db.findOne("book", {
			select: ["id", "title", "createdAt"],
			include: {
				author: {
					select: ["id", "name"],
				},
			},
			where: { id: data.bookId },
		});
	});

const deleteBook = createServerFn({ method: "POST" })
	.inputValidator((data: { bookId: number }) => data)
	.handler(async ({ data }) => {
		return db.deleteOne("book", {
			where: { id: data.bookId },
			returning: ["id"],
		});
	});

export const Route = createFileRoute("/books/$bookId")({
	component: BookDetail,
	loader: ({ params }) => getBook({ data: { bookId: Number(params.bookId) } }),
});

function BookDetail() {
	const book = Route.useLoaderData();
	const navigate = useNavigate();

	if (!book) {
		return (
			<div className="min-h-screen bg-gray-50 py-12 px-4">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Book not found
					</h1>
					<Link to="/books" className="text-blue-600 hover:underline">
						Back to books
					</Link>
				</div>
			</div>
		);
	}

	const handleDelete = async () => {
		if (!confirm("Delete this book?")) return;
		await deleteBook({ data: { bookId: book.id } });
		navigate({ to: "/books" });
	};

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-between items-start mb-8">
					<div>
						<Link
							to="/books"
							className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
						>
							← Back to books
						</Link>
						<h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
						<p className="text-gray-600 mt-1">
							by{" "}
							<Link
								to="/authors/$authorId"
								params={{ authorId: String(book.author.id) }}
								className="text-blue-600 hover:underline"
							>
								{book.author.name}
							</Link>
						</p>
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
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
					<dl className="space-y-3">
						<div>
							<dt className="text-sm text-gray-500">Title</dt>
							<dd className="text-gray-900">{book.title}</dd>
						</div>
						<div>
							<dt className="text-sm text-gray-500">Author</dt>
							<dd className="text-gray-900">{book.author.name}</dd>
						</div>
						<div>
							<dt className="text-sm text-gray-500">Added</dt>
							<dd className="text-gray-900">
								{new Date(book.createdAt).toLocaleDateString()}
							</dd>
						</div>
					</dl>
				</div>
			</div>
		</div>
	);
}
