import { ResearchPlan, ResearchStep } from '../types';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export class ResearchPlanner {
  private openai;

  constructor() {
    this.openai = createOpenAI({
      baseURL: `https://${process.env.GAIA_MODEL_BASE_URL}`,
      apiKey: process.env.GAIA_API_KEY,
    });
  }

  async createPlan(query: string): Promise<ResearchPlan> {
    // For simple queries, we can use a basic plan
    if (query.length < 10 || query.split(' ').length < 3) {
      return this.createBasicPlan(query);
    }
    
    // For more complex queries, generate a plan with AI
    try {
      const { text: planText } = await generateText({
        model: this.openai('llama'),
        messages: [
          {
            role: "system",
            content: `Create a research plan to answer the query. The plan should include a logical sequence of steps using these tools:
            - search: Search the web for information
            - fetch_webpage: Extract content from a specific URL
            - fetch_paper: Access academic paper information
            - fetch_github: Explore a GitHub repository
            - summarize: Summarize findings from previous steps
            
            Format your response as a JSON array of steps, each with:
            - id (number)
            - description (string)
            - action: { type: string, params: object }
            - dependencies (array of step IDs, optional)
            
            For example:
            [
              {
                "id": 1,
                "description": "Search for recent information",
                "action": {
                  "type": "search",
                  "params": {
                    "query": "the search query"
                  }
                }
              },
              {
                "id": 2,
                "description": "Summarize the findings",
                "dependencies": [1],
                "action": {
                  "type": "summarize",
                  "params": {
                    "query": "summarize the search results"
                  }
                }
              }
            ]`
          },
          {
            role: "user",
            content: `Create a detailed research plan for this query: "${query}"`
          }
        ]
      });
      
      let steps: ResearchStep[] = [];
      
      try {
        steps = JSON.parse(planText);
      } catch (e) {
        // If parsing fails, try to extract JSON using regex
        const jsonMatch = planText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          steps = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse research plan');
        }
      }
      
      // Add status to each step
      steps = steps.map(step => ({
        ...step,
        status: 'pending'
      }));
      
      return {
        query,
        steps
      };
    } catch (error) {
      console.error('Error generating research plan:', error);
      // Fall back to basic plan if AI plan generation fails
      return this.createBasicPlan(query);
    }
  }
  
  private createBasicPlan(query: string): ResearchPlan {
    return {
      query,
      steps: [
        {
          id: 1,
          description: "Search for information",
          status: 'pending',
          action: {
            type: "search",
            params: {
              query: query,
            },
          },
        },
        {
          id: 2,
          description: "Summarize findings",
          status: 'pending',
          dependencies: [1],
          action: {
            type: "summarize",
            params: {
              query: `Summarize the search results about: ${query}`,
            },
          },
        },
      ],
    };
  }
}