const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        this.apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!this.apiKey) {
            throw new Error('GOOGLE_GEMINI_API_KEY environment variable is required');
        }
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    async analyzeNotesAndGenerateResources(notes) {
        try {
            // Prepare the notes data for analysis
            const notesText = notes.map(note =>
                `Title: ${note.title}\nContent: ${note.content}\nDate: ${note.last_updated}\n---`
            ).join('\n');

            const prompt = `
You are a mental health AI assistant. Analyze the following journal entries and generate relevant mental health resources and insights.

Journal Entries:
${notesText}

Please provide:
1. A brief analysis of the emotional patterns and themes in these entries
2. 3-5 specific mental health resources (articles, exercises, techniques, or tools) that would be helpful
3. Gentle, supportive recommendations based on the content

IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or additional text.

Format your response as JSON with this exact structure:
{
  "analysis": "Brief analysis of patterns and themes",
  "resources": [
    {
      "title": "Resource title",
      "description": "Brief description",
      "type": "article|exercise|technique|tool",
      "url": "optional URL if applicable"
    }
  ],
  "recommendations": "Supportive recommendations based on the analysis"
}

Example response format:
{
  "analysis": "The entries show patterns of...",
  "resources": [
    {
      "title": "Mindfulness Breathing Exercise",
      "description": "A simple 5-minute breathing technique to help center yourself",
      "type": "exercise",
      "url": null
    }
  ],
  "recommendations": "Based on your entries, consider trying..."
}

Keep the response supportive, non-judgmental, and focused on mental wellness. Do not provide medical advice. Return only the JSON object.
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            console.log('Gemini raw response:', text.substring(0, 200) + '...');

            // Try to parse the JSON response
            try {
                // Clean the response text - remove any markdown code blocks if present
                let cleanText = text.trim();
                if (cleanText.startsWith('```json')) {
                    cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (cleanText.startsWith('```')) {
                    cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }
                
                const parsedResponse = JSON.parse(cleanText);
                
                // Validate the response structure
                if (!parsedResponse.analysis || !parsedResponse.resources || !parsedResponse.recommendations) {
                    throw new Error('Invalid response structure');
                }
                
                // Ensure resources is an array
                if (!Array.isArray(parsedResponse.resources)) {
                    parsedResponse.resources = [];
                }
                
                // Validate each resource has required fields
                parsedResponse.resources = parsedResponse.resources.map(resource => ({
                    title: resource.title || 'Untitled Resource',
                    description: resource.description || 'No description available',
                    type: resource.type || 'tool',
                    url: resource.url || null
                }));
                
                return {
                    success: true,
                    data: parsedResponse
                };
            } catch (parseError) {
                console.warn('Failed to parse Gemini response as JSON:', parseError.message);
                console.warn('Raw response:', text);
                
                // If JSON parsing fails, return the raw text in a structured format
                return {
                    success: true,
                    data: {
                        analysis: "AI analysis completed successfully. The response format was unexpected, but the analysis was generated.",
                        resources: [{
                            title: "AI Analysis Results",
                            description: text,
                            type: "analysis",
                            url: null
                        }],
                        recommendations: "Please review the analysis above for insights and recommendations. The AI has provided valuable insights about your journal entries."
                    }
                };
            }
        } catch (error) {
            console.error('Error in Gemini analysis:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async generateQuickInsight(notes) {
        try {
            const notesText = notes.slice(0, 3).map(note =>
                `Title: ${note.title}\nContent: ${note.content}`
            ).join('\n\n');

            const prompt = `
Based on these recent journal entries, provide a brief, supportive insight or encouragement:

${notesText}

Keep it under 100 words, positive, and focused on growth and wellness.
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return {
                success: true,
                insight: text.trim()
            };
        } catch (error) {
            console.error('Error generating quick insight:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = GeminiService;
