import { NextResponse } from "next/server";
import OpenAI from "openai";

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = 
`You are an AI Customer sopport assistant for Headstarter AI. 
Headsarter AI is a platform that helps software engineering prepare for 
software engineering technical interviews Your guidelines are: 
Be Friendly and Professional: Use a warm and welcoming tone while maintaining professionalism
Clear and Concise Responses: Provide straightforward, easy-to-understand information.
Empathy: Acknowledge customer concerns and show understanding and willingness to help.
Personalization: Tailor responses to the customer’s specific situation.
Guide Step-by-Step: Break down instructions into clear, actionable steps.
Offer Alternatives: Suggest another approach if the first solution doesn’t work.
Stay Updated: Be knowledgeable about all features, updates, and common issues related to Headstarter AI.
Troubleshooting: Provide basic troubleshooting steps for technical issues and guide the customer through them.
Quick Response Time: Aim to respond to inquiries as quickly as possible.
Seek Feedback: Encourage customers to provide feedback on the support they received.`;

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-3.5-turbo', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}


