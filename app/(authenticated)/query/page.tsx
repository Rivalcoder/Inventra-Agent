"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { runSqlQuery, runMongoQuery } from "@/lib/data";
import { Toggle } from "@/components/ui/toggle";

interface QueryResult {
  data: {
    Topic: {
      Heading: string;
      Description: string;
      Language?: 'sql' | 'mongodb';
      SqlQuery?: string[];
      MongoQuery?: string[];
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
  const [showMongo, setShowMongo] = useState(false); // NEW: toggle for Mongo query

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('ai-inventory-query-history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ai-inventory-query-history', JSON.stringify(history));
  }, [history]);

  const processQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    
    try {
      // Get database configuration from localStorage
      const databaseConfig = localStorage.getItem('databaseConfig');
      if (!databaseConfig) {
        toast({
          title: "Database Configuration Required",
          description: "Please configure your database first.",
          variant: "destructive",
        });
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
        toast({
          title: "Invalid Database Configuration",
          description: "Please reconfigure your database.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers,
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

      // Always get the latest history from localStorage
      let latestHistory: string[] = [];
      try {
        const stored = localStorage.getItem('ai-inventory-query-history');
        if (stored) latestHistory = JSON.parse(stored);
      } catch {}
      // Remove duplicate if present
      latestHistory = latestHistory.filter(q => q !== query);
      // Add new query to the top, keep max 5
      const newHistory = [query, ...latestHistory].slice(0, 5);
      setHistory(newHistory);

      setQuery(""); // Clear the input field after successful response

      // --- NEW: Execute DB query based on configured DB type and language ---
      const dbConfigRaw = localStorage.getItem('databaseConfig');
      let configuredDbType: 'mysql' | 'postgresql' | 'mongodb' | undefined;
      try { configuredDbType = dbConfigRaw ? JSON.parse(dbConfigRaw)?.type : undefined; } catch {}
      const language = data.response?.Topic?.Language as ('sql' | 'mongodb' | undefined);
      const sqlQueries = data.response?.Topic?.SqlQuery;
      const steps = Array.isArray(data.response?.Topic?.Steps) ? data.response.Topic.Steps : null;
      // Prefer structured Steps for multi-command execution
      const mongoFromSteps = steps ? steps.map((s: any) => s?.Mongo).filter((v: any) => typeof v === 'string' && v.trim().length > 0) : [];
      const mongoQueries = mongoFromSteps.length > 0 ? mongoFromSteps : data.response?.Topic?.MongoQuery;
      let dbChangeMessages: string[] = [];
      let dbHeadline: string | null = null;
      if ((configuredDbType === 'mongodb') && Array.isArray(mongoQueries) && mongoQueries.length > 0) {
        try {
          const execResult = await runMongoQuery(mongoQueries);
          dbChangeMessages.push('Mongo command(s) executed successfully.');
          dbHeadline = 'Mongo command(s) executed successfully.';
          toast({ title: 'Database Updated', description: 'Mongo command(s) executed successfully.' });
        } catch (err: any) {
          const errMsg = 'Database error: ' + (err.message || 'Failed to execute Mongo command(s).');
          dbChangeMessages.push(errMsg);
          dbHeadline = errMsg;
          toast({ title: 'Database Error', description: err.message || 'Failed to execute Mongo command(s).', variant: 'destructive' });
        }
      } else if ((configuredDbType !== 'mongodb') && Array.isArray(sqlQueries) && sqlQueries.length > 0) {
        for (const sql of sqlQueries) {
          try {
            const execResult = await runSqlQuery(sql);
            if (/^insert/i.test(sql)) {
              dbChangeMessages.push("Insert executed successfully.");
              dbHeadline = "Insert executed successfully.";
            } else if (/^update/i.test(sql)) {
              dbChangeMessages.push("Update executed successfully.");
              dbHeadline = "Update executed successfully.";
            } else if (/^delete/i.test(sql)) {
              dbChangeMessages.push("Delete executed successfully.");
              dbHeadline = "Delete executed successfully.";
            } else {
              dbChangeMessages.push("Query executed successfully.");
              dbHeadline = "Query executed successfully.";
            }
            toast({
              title: "Database Updated",
              description: `Query executed successfully.`,
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
            break; // Stop executing further queries on first error
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
                  <div className="bg-card rounded-lg shadow p-6 border border-border">
                    <h2 className="text-2xl font-bold text-card-foreground mb-4">
                      {result.data.Topic.Heading}
                    </h2>
                    
                    <div className="space-y-4">
                      {result.data.Topic.Description && (
                        <div className="text-foreground markdown-content">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h3: ({ node, ...props }) => (
                                <h3 className="text-lg font-medium text-foreground mt-6 mb-3" {...props} />
                              ),
                              p: ({ node, ...props }) => (
                                <p className="text-sm text-foreground my-2" {...props} />
                              ),
                              table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-4">
                                  <table className="min-w-full border-collapse border border-border" {...props} />
                                </div>
                              ),
                              th: ({ node, ...props }) => (
                                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted border border-border" {...props} />
                              ),
                              td: ({ node, ...props }) => (
                                <td className="px-4 py-2 text-sm text-foreground whitespace-nowrap border border-border" {...props} />
                              ),
                              tr: ({ node, ...props }) => (
                                <tr className="hover:bg-muted/50" {...props} />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="list-disc list-inside space-y-1 text-sm text-foreground my-2" {...props} />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol className="list-decimal list-inside space-y-1 text-sm text-foreground my-2" {...props} />
                              ),
                              li: ({ node, ...props }) => (
                                <li className="text-sm text-foreground my-1" {...props} />
                              ),
                              blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-primary pl-4 py-1 my-2 text-sm text-foreground italic" {...props} />
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
                              border: 1px solid hsl(var(--border));
                              padding: 0.5rem 1rem;
                              text-align: left;
                            }
                            .markdown-content th {
                              background-color: hsl(var(--muted));
                              font-weight: 500;
                              text-transform: uppercase;
                              font-size: 0.75rem;
                            }
                            .markdown-content tr:nth-child(even) {
                              background-color: hsl(var(--muted) / 0.5);
                            }
                            .markdown-content tr:hover {
                              background-color: hsl(var(--muted) / 0.8);
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
                              border-left: 4px solid hsl(var(--primary));
                              font-style: italic;
                            }
                          `}</style>
                        </div>
                      )}
                      {/* Show explanation if present */}
                      {result.explanation && (
                        <div className="text-foreground text-sm whitespace-pre-line">
                          {result.explanation}
                        </div>
                      )}
                    </div>
                    {/* Language badge */}
                    {(result.data.Topic.Language || Array.isArray(result.data.Topic.MongoQuery)) && (
                      <div className="mt-2 text-xs text-muted-foreground">Language: {result.data.Topic.Language || 'mongodb'}</div>
                    )}
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
                          <pre className="bg-muted rounded p-4 mt-2 text-xs overflow-x-auto border border-border">
                            {result.data.Topic.SqlQuery.join('\n\n')}
                          </pre>
                        )}
                      </div>
                    )}
                    {/* Mongo Query Toggle */}
                    {Array.isArray(result.data.Topic.MongoQuery) && result.data.Topic.MongoQuery.length > 0 && (
                      <div className="mt-8">
                        <Toggle
                          pressed={showMongo}
                          onPressedChange={setShowMongo}
                          className="mb-2"
                        >
                          Show Mongo Command(s)
                        </Toggle>
                        {showMongo && (
                          <pre className="bg-muted rounded p-4 mt-2 text-xs overflow-x-auto border border-border">
                            {result.data.Topic.MongoQuery.join('\n\n')}
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
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {history.map((historicalQuery, index) => (
                    <div key={index} className="relative group">
                      <Button
                        variant="outline"
                        className="w-full min-h-[2.5rem] max-h-10 overflow-hidden text-ellipsis whitespace-nowrap justify-start text-left px-3 py-2 text-sm"
                        style={{ wordBreak: 'break-all', whiteSpace: 'nowrap' }}
                        onClick={() => selectFromHistory(historicalQuery)}
                        title={historicalQuery}
                      >
                        {historicalQuery}
                      </Button>
                      {/* Tooltip for full query on hover */}
                      <div className="absolute left-0 z-10 hidden group-hover:block bg-popover border border-border shadow-lg rounded p-2 text-xs max-w-xs max-h-40 overflow-y-auto whitespace-pre-wrap text-popover-foreground" style={{ top: '110%' }}>
                        {historicalQuery}
                      </div>
                    </div>
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