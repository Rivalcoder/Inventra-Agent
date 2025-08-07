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
    name: z.string().min(5).max(30),
    Topics: z.array(z.string()).min(10),
    Steps: z.array(z.string().min(100)).min(10),
    SqlQuery: z.array(z.string()).optional(), // <-- Add this line
  }),
});

export default function AIQueryPage() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
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
      } catch (error) {
        toast.error('Invalid database configuration. Please reconfigure your database.');
        return;
      }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI service');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Parse and validate the response
      const parsedResponse = JSON.parse(data.response);
      const validatedResponse = responseSchema.parse(parsedResponse);
      alert(validatedResponse);

      setResponse(validatedResponse);
      toast.success('Query processed successfully');

      // --- NEW: Execute SQL if present ---
      const sqlQueries = validatedResponse?.Topic?.SqlQuery;
      if (Array.isArray(sqlQueries) && sqlQueries.length > 0) {
        for (const sql of sqlQueries) {
          try {
            const execResult = await runSqlQuery(sql);
            toast.success('Database updated successfully');
          } catch (err: any) {
            toast.error(err.message || 'Failed to execute SQL query');
            break; // Stop executing further queries on first error
          }
        }
      }
      // --- END NEW ---
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
              <h3 className="text-lg font-semibold">{response.Topic.name}</h3>
              
              <div>
                <h4 className="font-medium mb-2">Sub-topics:</h4>
                <ul className="list-disc pl-5">
                  {response.Topic.Topics.map((topic: string, index: number) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Steps:</h4>
                <ol className="list-decimal pl-5">
                  {response.Topic.Steps.map((step: string, index: number) => (
                    <li key={index} className="mb-2">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 