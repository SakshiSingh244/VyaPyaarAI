import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";


const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("Google API key is not configured. Please set VITE_GOOGLE_API_KEY in your environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);
export async function generatePlatformRecommendations(userInput: {
  productType: string;
  experienceLevel: string;
  budget: string;
  region: string;
}): Promise<string> {
  const { productType, experienceLevel, budget, region } = userInput;

  const prompt = `
You are a smart startup advisor for new Indian sellers. Based on the user's product type, experience, budget, and target region, recommend the best 3 platforms to start selling online.

Include:
- Platform name
- 1–2 sentences about why it's suitable for the user

### User Input:
- Product Type: ${productType}
- Experience Level: ${experienceLevel}
- Budget: ${budget}
- Region: ${region}

### Output Format:
Just list the top 3 recommendations like this:

1. **Platform Name**: Explanation...
2. **Platform Name**: Explanation...
3. **Platform Name**: Explanation...
`.trim();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      }
    ],
    generationConfig: {
      maxOutputTokens: 800,
      temperature: 0.6,
      topP: 0.9,
    },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}
interface GeneratedContent {
  title: string;
  bulletPoints: string[];
  seoDescription: string;
}

export async function generateProductListing(productData: {
  productName: string;
  description: string;
  category: string;
  platform: string;
}): Promise<GeneratedContent> {
  try {
    // Initialize model with safety settings and generation config
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash", // Updated to latest recommended model
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        }
      ],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const prompt = `
# E-Commerce Listing Content Generation

## Role
You are an expert eCommerce copywriter with 10+ years of experience creating high-converting product listings for ${productData.platform}. 

## Task
Create compelling, conversion-optimized content for this product that will:
- Attract more buyers
- Improve search ranking
- Highlight unique value propositions
- Address customer pain points

## Product Details
- **Product Name**: ${productData.productName}
- **Category**: ${productData.category}
- **Key Features**: ${productData.description}
- **Target Platform**: ${productData.platform}

## Content Requirements
1. **Listing Title** (Max 60 characters)
   - Include primary keyword naturally
   - Create urgency/desire
   - Highlight main benefit

2. **5 Key Features** (Bullet points)
   - Focus on benefits, not just features
   - Use power words (e.g., "Premium", "Instant", "Guaranteed")
   - Include emotional triggers
   - Address common objections

3. **SEO-Optimized Description** (150-300 characters)
   - Naturally include 2-3 relevant keywords
   - Tell a mini-story about the product's value
   - Include a subtle call-to-action
   - Match ${productData.platform}'s style guidelines

## Output Format
Provide response as valid JSON only (no additional text):

{
  "title": "Engaging product title that sells",
  "bulletPoints": [
    "Benefit-driven feature 1",
    "Benefit-driven feature 2",
    "Benefit-driven feature 3",
    "Benefit-driven feature 4",
    "Benefit-driven feature 5"
  ],
  "seoDescription": "Compelling product story with keywords that will rank well and convert browsers into buyers."
}

## Style Guidelines
- Tone: Friendly yet professional
- Voice: Active, benefit-focused
- Reading level: 8th grade
- Avoid: Generic phrases, hype language, false claims
`.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean and parse the response
    const cleanText = text
      .replace(/^```json|```$/g, '') // Remove markdown code blocks
      .trim();

    const parsed = JSON.parse(cleanText);

    // Validate response structure
    if (
      !parsed.title || 
      !parsed.bulletPoints || 
      !parsed.seoDescription ||
      !Array.isArray(parsed.bulletPoints) ||
      parsed.bulletPoints.length !== 5
    ) {
      throw new Error("Invalid response format from Gemini API");
    }

    return {
      title: parsed.title.trim(),
      bulletPoints: parsed.bulletPoints.map((point: string) => point.trim()),
      seoDescription: parsed.seoDescription.trim()
    };
  } catch (error) {
    console.error("Error in generateProductListing:", error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Failed to generate content. Please check your API key and try again."
    );
  }
}
