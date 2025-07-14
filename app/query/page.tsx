"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { runSqlQuery } from "@/lib/data";
import { Toggle } from "@/components/ui/toggle";

interface QueryResult {
  data: {
    Topic: {
      Heading: string;
      Description: string;
      SqlQuery?: string[];
    };
  };
  type: string;
  explanation: string;
  rawData: any;
  dbHeadline?: string; // Added for DB change headline
}

const exampleQuestions = [
  "What are our top 5 selling products?",
  "Which products are running low on stock?",
  "Show me the total sales for this month",
  "What's our inventory value?",
  "Which products need to be restocked soon?",
  "What's the trend in our sales?",
  "Which category has the highest revenue?",
  "What's our profit margin?",
  "Show me products with declining sales",
  "What's our best performing product category?"
];

export default function QueryPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const { toast } = useToast();
  const [showSql, setShowSql] = useState(false); // NEW: toggle for SQL query

  const processQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to process query');
      }
      
      // Parse the AI response and format it for display
      const formattedResult: QueryResult = {
        type: 'text',
        data: data.response,
        explanation: 'AI-generated response based on your query and current data',
        rawData: data.data // Include the raw data for potential visualizations
      };
      console.log(formattedResult);
      setHistory(prev => [query, ...prev.slice(0, 4)]);
      setQuery(""); // Clear the input field after successful response

      // --- NEW: Execute SQL if present and collect messages ---
      const sqlQueries = data.response?.Topic?.SqlQuery;
      let dbChangeMessages: string[] = [];
      let dbHeadline: string | null = null;
      if (Array.isArray(sqlQueries) && sqlQueries.length > 0) {
        for (const sql of sqlQueries) {
          try {
            const execResult = await runSqlQuery(sql);
            if (/^insert/i.test(sql)) {
              dbChangeMessages.push("Product added successfully.");
              dbHeadline = "Product added successfully.";
            } else if (/^update/i.test(sql)) {
              dbChangeMessages.push("Product updated successfully.");
              dbHeadline = "Product updated successfully.";
            } else if (/^delete/i.test(sql)) {
              dbChangeMessages.push("Product deleted successfully.");
              dbHeadline = "Product deleted successfully.";
            } else {
              dbChangeMessages.push("Database updated successfully.");
              dbHeadline = "Database updated successfully.";
            }
            toast({
              title: "Database Updated",
              description: `Query executed successfully.`,
              variant: "success",
            });
          } catch (err: any) {
            const errMsg = "Database error: " + (err.message || "Failed to execute SQL query.");
            dbChangeMessages.push(errMsg);
            dbHeadline = errMsg;
            toast({
              title: "Database Error",
              description: err.message || "Failed to execute SQL query.",
              variant: "destructive",
            });
          }
        }
      }
      // --- END NEW ---

      // --- NEW: Update result with DB change messages and headline ---
      setResult({
        ...formattedResult,
        explanation: [
          formattedResult.explanation,
          ...dbChangeMessages
        ].filter(Boolean).join("\n\n"),
        dbHeadline: dbHeadline || undefined
      });
      // --- END NEW ---
    } catch (error: any) {
      console.error('Query processing error:', error);
      let message = error.message || "Failed to process your query. Please try again.";
      if (message.toLowerCase().includes("model is overloaded") || message.toLowerCase().includes("unavailable")) {
        message = "The AI service is currently overloaded. Please try again in a few minutes.";
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQuery();
  };

  const selectFromHistory = (historicalQuery: string) => {
    setQuery(historicalQuery);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Query Console</h1>
        <p className="text-muted-foreground">
          Ask questions about your inventory and sales data
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Ask a question about your inventory or sales..."
                className="min-h-[120px] resize-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <SendHorizontal className="mr-2 h-4 w-4" />
                      Ask Question
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              {result && (
                <div className="space-y-6">
                  {result.dbHeadline && (
                    <div className="text-green-700 text-2xl font-bold mb-4">{result.dbHeadline}</div>
                  )}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {result.data.Topic.Heading}
                    </h2>
                    
                    <div className="space-y-4">
                      {result.data.Topic.Description && (
                        <div className="text-gray-700 dark:text-gray-300 markdown-content">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h3: ({ node, ...props }) => (
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3" {...props} />
                              ),
                              p: ({ node, ...props }) => (
                                <p className="text-sm text-gray-600 dark:text-gray-300 my-2" {...props} />
                              ),
                              table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-4">
                                  <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700" {...props} />
                                </div>
                              ),
                              th: ({ node, ...props }) => (
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" {...props} />
                              ),
                              td: ({ node, ...props }) => (
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap border border-gray-200 dark:border-gray-700" {...props} />
                              ),
                              tr: ({ node, ...props }) => (
                                <tr className="hover:bg-gray-100 dark:hover:bg-gray-800/50" {...props} />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300 my-2" {...props} />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300 my-2" {...props} />
                              ),
                              li: ({ node, ...props }) => (
                                <li className="text-sm text-gray-600 dark:text-gray-300 my-1" {...props} />
                              ),
                              blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-2 text-sm text-gray-600 dark:text-gray-300 italic" {...props} />
                              ),
                            }}
                          >
                            {result.data.Topic.Description}
                          </ReactMarkdown>
                          <style jsx global>{`
                            .markdown-content {
                              width: 100%;
                            }
                            .markdown-content table {
                              width: 100%;
                              border-collapse: collapse;
                              margin: 1rem 0;
                            }
                            .markdown-content th,
                            .markdown-content td {
                              border: 1px solid #e5e7eb;
                              padding: 0.5rem 1rem;
                              text-align: left;
                            }
                            .markdown-content th {
                              background-color: #f9fafb;
                              font-weight: 500;
                              text-transform: uppercase;
                              font-size: 0.75rem;
                            }
                            .markdown-content tr:nth-child(even) {
                              background-color: #f9fafb;
                            }
                            .markdown-content tr:hover {
                              background-color: #f3f4f6;
                            }
                            .markdown-content h3 {
                              margin-top: 1.5rem;
                              margin-bottom: 0.75rem;
                              font-size: 1.125rem;
                              font-weight: 500;
                            }
                            .markdown-content p {
                              margin: 0.5rem 0;
                            }
                            .markdown-content ul,
                            .markdown-content ol {
                              margin: 0.5rem 0;
                              padding-left: 1.5rem;
                            }
                            .markdown-content li {
                              margin: 0.25rem 0;
                            }
                            .markdown-content blockquote {
                              margin: 0.5rem 0;
                              padding-left: 1rem;
                              border-left: 4px solid #3b82f6;
                              font-style: italic;
                            }
                            .dark .markdown-content th,
                            .dark .markdown-content td {
                              border-color: #374151;
                            }
                            .dark .markdown-content th {
                              background-color: #1f2937;
                            }
                            .dark .markdown-content tr:nth-child(even) {
                              background-color: #1f2937;
                            }
                            .dark .markdown-content tr:hover {
                              background-color: #374151;
                            }
                          `}</style>
                        </div>
                      )}
                      {/* Show explanation if present */}
                      {result.explanation && (
                        <div className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">
                          {result.explanation}
                        </div>
                      )}
                    </div>
                    {/* SQL Query Toggle placed below all content */}
                    {Array.isArray(result.data.Topic.SqlQuery) && result.data.Topic.SqlQuery.length > 0 && (
                      <div className="mt-8">
                        <Toggle
                          pressed={showSql}
                          onPressedChange={setShowSql}
                          className="mb-2"
                        >
                          Show SQL Query
                        </Toggle>
                        {showSql && (
                          <pre className="bg-gray-100 dark:bg-gray-800 rounded p-4 mt-2 text-xs overflow-x-auto">
                            {result.data.Topic.SqlQuery.join('\n\n')}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Recent Queries */}
          {history.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Recent Queries</h3>
                <div className="space-y-2">
                  {history.map((historicalQuery, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full py-6 whitespace-pre-wrap  justify-start text-left"
                      onClick={() => selectFromHistory(historicalQuery)}
                    >
                      {historicalQuery}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Example Questions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Example Questions</h3>
              <div className="space-y-2">
                {exampleQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => setQuery(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}