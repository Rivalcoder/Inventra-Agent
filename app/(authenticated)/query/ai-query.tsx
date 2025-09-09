'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { runSqlQuery } from "@/lib/data";

// Define the schema for the response
const responseSchema = z.object({
	Topic: z.object({
		Heading: z.string(),
		Description: z.string(),
		SqlQuery: z.array(z.string()).optional(),
	}),
});

export default function AIQueryPage() {
	const [query, setQuery] = useState('');
	const [response, setResponse] = useState<z.infer<typeof responseSchema> | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		if (!query.trim()) {
			toast.error('Please enter a query');
			return;
		}

		setLoading(true);
		try {
			// Get database configuration from localStorage
			const databaseConfig = localStorage.getItem('databaseConfig');
			if (!databaseConfig) {
				toast.error('Database configuration not found. Please configure your database first.');
				return;
			}

			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
			};

			// Add database configuration to headers
			try {
				const dbConfig = JSON.parse(databaseConfig);
				headers['x-user-db-config'] = JSON.stringify(dbConfig);
				if (dbConfig?.userId) headers['x-user-id'] = String(dbConfig.userId);
			} catch (error) {
				toast.error('Invalid database configuration. Please reconfigure your database.');
				return;
			}

			const res = await fetch('/api/ai', {
				method: 'POST',
				headers,
				body: JSON.stringify({ query }),
			});

			if (!res.ok) {
				throw new Error('Failed to get response from AI service');
			}

			const data = await res.json();
			if (data.error) {
				throw new Error(data.error);
			}

			// Parse and validate the response
			const validatedResponse = responseSchema.parse(data.response);
			setResponse(validatedResponse);
			toast.success('Query processed successfully');

			// Execute SQL only for SQL databases (MySQL/PostgreSQL)
			const sqlQueries = validatedResponse?.Topic?.SqlQuery;
			if (Array.isArray(sqlQueries) && sqlQueries.length > 0) {
				for (const sql of sqlQueries) {
					try {
						await runSqlQuery(sql);
						toast.success('Database updated successfully');
					} catch (err: any) {
						toast.error(err.message || 'Failed to execute SQL query');
						break; // Stop executing further queries on first error
					}
				}
			}
		} catch (error: any) {
			console.error('Error processing query:', error);
			toast.error(error.message || 'Failed to process query');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4 md:p-6">
			<Card className="w-full">
				<CardHeader>
					<CardTitle>AI-Powered Query</CardTitle>
					<CardDescription>
						Enter your query to get AI-generated insights about your inventory and sales data
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Textarea
							placeholder="Enter your query here... (e.g., 'Analyze my top selling products and suggest inventory adjustments')"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="min-h-[100px]"
						/>
						<Button 
							onClick={handleSubmit}
							disabled={loading}
							className="w-full"
						>
							{loading ? 'Processing...' : 'Submit Query'}
						</Button>
					</div>

					{response && (
						<div className="mt-6 space-y-4">
							{response.Topic.Heading && (
								<h3 className="text-lg font-semibold">{response.Topic.Heading}</h3>
							)}
							{response.Topic.Description && (
								<p className="text-sm whitespace-pre-wrap">{response.Topic.Description}</p>
							)}
							{Array.isArray(response.Topic.SqlQuery) && response.Topic.SqlQuery.length > 0 && (
								<div className="space-y-2">
									{response.Topic.SqlQuery.map((q, i) => (
										<pre key={i} className="bg-muted p-3 rounded border text-xs overflow-auto">
											<code className="language-sql">{q}</code>
										</pre>
									))}
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
} 