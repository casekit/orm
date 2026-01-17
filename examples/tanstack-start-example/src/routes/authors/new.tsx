import { db } from "@/db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";

const createAuthor = createServerFn({ method: "POST" })
	.inputValidator((data: { name: string }) => data)
	.handler(async ({ data }) => {
		const result = await db.createOne("author", {
			values: { name: data.name },
			returning: ["id"],
		});
		return result;
	});

export const Route = createFileRoute("/authors/new")({
	component: NewAuthor,
});

function NewAuthor() {
	const navigate = useNavigate();
	const [name, setName] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;
		const author = await createAuthor({ data: { name: name.trim() } });
		await navigate({
			to: "/authors/$authorId",
			params: { authorId: String(author.id) },
		});
	};

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4">
			<div className="max-w-md mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">New Author</h1>

				<form
					onSubmit={handleSubmit}
					className="bg-white rounded-lg shadow p-6"
				>
					<div className="mb-4">
						<span className="block text-sm font-medium text-gray-700 mb-1">
							Name
						</span>
						<input
							type="text"
							name="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="Author name"
						/>
					</div>

					<div className="flex gap-3">
						<button
							type="button"
							onClick={() => navigate({ to: "/authors" })}
							className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={!name.trim()}
							className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Create
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
