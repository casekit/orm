import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { db } from "@/db";

const getAuthors = createServerFn({ method: "GET" }).handler(async () => {
	return db.findMany("author", {
		select: ["id", "name"],
		orderBy: ["name"],
	});
});

const createBook = createServerFn({ method: "POST" })
	.inputValidator((data: { title: string; authorId: number }) => data)
	.handler(async ({ data }) => {
		return db.createOne("book", {
			values: { title: data.title, authorId: data.authorId },
			returning: ["id"],
		});
	});

export const Route = createFileRoute("/books/new")({
	component: NewBook,
	validateSearch: (search: Record<string, unknown>) => ({
		authorId: search.authorId ? Number(search.authorId) : undefined,
	}),
	loader: () => getAuthors(),
});

function NewBook() {
	const navigate = useNavigate();
	const authors = Route.useLoaderData();
	const { authorId: preselectedAuthorId } = Route.useSearch();

	const [title, setTitle] = useState("");
	const [authorId, setAuthorId] = useState<number | "">(
		preselectedAuthorId ?? "",
	);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !authorId) return;

		setIsSubmitting(true);
		const book = await createBook({
			data: { title: title.trim(), authorId: Number(authorId) },
		});
		navigate({ to: "/books/$bookId", params: { bookId: String(book.id) } });
	};

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4">
			<div className="max-w-md mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">New Book</h1>

				{authors.length === 0 ? (
					<div className="bg-white rounded-lg shadow p-6 text-center">
						<p className="text-gray-500 mb-4">
							You need to create an author first.
						</p>
						<button
							type="button"
							onClick={() => navigate({ to: "/authors/new" })}
							className="text-blue-600 hover:underline"
						>
							Create an author
						</button>
					</div>
				) : (
					<form
						onSubmit={handleSubmit}
						className="bg-white rounded-lg shadow p-6"
					>
						<div className="mb-4">
							<span className="block text-sm font-medium text-gray-700 mb-1">
								Title
							</span>
							<input
								type="text"
								name="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="Book title"
							/>
						</div>

						<div className="mb-6">
							<span className="block text-sm font-medium text-gray-700 mb-1">
								Author
							</span>
							<select
								name="author"
								value={authorId}
								onChange={(e) =>
									setAuthorId(e.target.value ? Number(e.target.value) : "")
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
							>
								<option value="">Select an author</option>
								{authors.map((author) => (
									<option key={author.id} value={author.id}>
										{author.name}
									</option>
								))}
							</select>
						</div>

						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => navigate({ to: "/books" })}
								className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={!title.trim() || !authorId || isSubmitting}
								className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSubmitting ? "Creating..." : "Create"}
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
