import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const VALID_CATEGORIES = ["Investing", "Saving", "Retirement", "Crypto", "Real Estate", "Side Hustles"];

const ARTICLE_FORMAT_INSTRUCTIONS = `You are writing for Menshlynews, a financial education blog. Write in first person, conversational tone, like a friend who's actually done this. Be specific with real numbers, tool names, and URLs. No fluff, no filler, no generic advice.

MANDATORY FORMAT - Follow this structure exactly:

## [Section Title]
[Opening paragraph - 3-5 sentences minimum, personal story or compelling hook]

## Why This Works Right Now
[Market data, timing, opportunity - include specific numbers and statistics]

## The Realistic Picture
[5 truth blockquotes like:]
> **Truth #1:** [honest reality check]

## The Free Stack
[List free tools with HACK blockquotes]
> **HACK:** [specific power-user tip]

## The Paid Stack
[Markdown table:]
| Tool | Cost | Purpose |
|------|------|---------|
| [Tool] | $X/mo | [What it does] |
| **Total** | **$X/mo** | |

## The Workflow: Step-by-Step
**Step 1: [Name] (Day X)**
- [Specific action items]
- ✅ Check-in: [What should be verified at this point]

## Pricing: What to Charge
| Tier | Price | Includes | Best For |
|------|-------|----------|----------|

## Getting Clients / Customers
**Method 1: [Name] (X% conversion rate)**
[Detailed approach]

## Tricks and Hacks
> **HACK:** [Specific actionable tip] (repeat 3-5 times)

## The Real Numbers
| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|

## What Nobody Warns You About
- [Honest warnings, 5-6 items]

## Start This Weekend
**Pre-Weekend Checklist**
- ✅ [Items]

**Saturday Morning (9 AM – 12 PM): [Focus]**
1. [Steps]
❓ **Self-Check:** [Question]

**Saturday Afternoon (1 PM – 5 PM): [Focus]**
1. [Steps]
❓ **Self-Check:** [Question]

**Saturday Evening (7 PM – 9 PM): [Focus]**
1. [Steps]
❓ **Self-Check:** [Question]

**Sunday Morning (9 AM – 12 PM): [Focus]**
1. [Steps]
❓ **Self-Check:** [Question]

**Sunday Afternoon (1 PM – 5 PM): [Focus]**
1. [Steps]

**Week 1 Action Plan**
| Day | Task | Time | Expected Outcome |
|-----|------|------|-----------------|

**First Month Milestones**
- **Week 1-4:** [Benchmarks]

**Red Flags to Watch For**
- 🚩 [Warnings]

**Your 30-Day Check-In Questions**
1-6. [Reflection questions]

CRITICAL RULES:
- Minimum 2000 words total
- Every paragraph must be 3-5 sentences minimum
- Use markdown tables with | separators
- Include > **HACK:** blockquotes throughout
- Use ✅ for check-ins and ❓ for self-check questions
- Include real tool names, prices, and URLs
- Write as if you've actually done this business
- Start This Weekend section must be 800-1200 words`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, excerpt } = body;

    if (!title || !category || !excerpt) {
      return NextResponse.json(
        { error: "Missing required fields: title, category, excerpt" },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate article content
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: ARTICLE_FORMAT_INSTRUCTIONS },
        {
          role: "user",
          content: `Write a complete article titled "${title}" in the category "${category}". The excerpt is: "${excerpt}". Follow the format exactly. Write at least 2000 words. Include markdown tables, HACK blockquotes, step-by-step workflows, and a comprehensive Start This Weekend section.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 8000,
    });

    const content = completion.choices[0]?.message?.content || "";
    const wordCount = content.split(/\s+/).length;

    // Generate image
    const imagePrompts: Record<string, string> = {
      Investing: "Professional investment analysis workspace with stock charts",
      Saving: "Smart saving budgeting workspace with financial planning app",
      Retirement: "Relaxed retirement planning scene with tablet and warm lighting",
      Crypto: "Cryptocurrency trading setup with blockchain data on monitors",
      "Real Estate": "Real estate investment workspace with property listings",
      "Side Hustles": "Modern side hustle workspace with income dashboards",
    };

    const imagePrompt = imagePrompts[category] || "Professional workspace with laptop";
    const imageFilename = `article-${Date.now()}.png`;
    const imagePath = join(process.cwd(), "public", "images", imageFilename);

    let imageUrl = `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop`;
    try {
      execSync(
        `z-ai-generate -p "${imagePrompt}" -o "${imagePath}" -s 1344x768`,
        { stdio: "pipe", timeout: 120000 }
      );
      imageUrl = `/images/${imageFilename}`;
    } catch {
      // Fallback to Unsplash
    }

    // Build post object
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);

    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const post = {
      id: String(Date.now()),
      title,
      slug,
      excerpt,
      category,
      image: imageUrl,
      author: "Horsnel John",
      date: dateStr,
      readTime: `${Math.max(6, Math.ceil(wordCount / 250))} min read`,
      content,
      likes: Math.floor(Math.random() * 500) + 500,
      shares: Math.floor(Math.random() * 100) + 50,
      tags: extractTags(title, category),
    };

    // Insert into data.ts
    insertPostIntoDataTs(post);

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        wordCount,
        readTime: post.readTime,
        image: post.image,
      },
    });
  } catch (error) {
    console.error("Article generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate article" },
      { status: 500 }
    );
  }
}

function extractTags(title: string, category: string): string[] {
  const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  const stopWords = new Set(["a", "an", "the", "for", "and", "or", "in", "on", "to", "with", "using", "how", "your", "from"]);
  const meaningful = words.filter((w) => w.length > 3 && !stopWords.has(w));
  const tags = meaningful.slice(0, 3);
  if (!tags.includes(category.toLowerCase())) tags.push(category.toLowerCase());
  return tags.slice(0, 4);
}

function insertPostIntoDataTs(post: Record<string, unknown>): void {
  const dataPath = join(process.cwd(), "src", "lib", "data.ts");
  if (!existsSync(dataPath)) return;

  let data = readFileSync(dataPath, "utf-8");
  const escapedContent = String(post.content)
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");

  const newPostStr = `  {
    id: "${post.id}",
    title: "${String(post.title).replace(/"/g, '\\"')}",
    slug: "${post.slug}",
    excerpt: "${String(post.excerpt).replace(/"/g, '\\"')}",
    category: "${post.category}",
    image: "${post.image}",
    author: "${post.author}",
    date: "${post.date}",
    readTime: "${post.readTime}",
    likes: ${post.likes},
    shares: ${post.shares},
    tags: ${JSON.stringify(post.tags)},
    content: \`${escapedContent}\`
  }`;

  const lastPostEnd = data.lastIndexOf("  }\n];");
  if (lastPostEnd === -1) return;

  const before = data.slice(0, lastPostEnd);
  const after = data.slice(lastPostEnd);
  writeFileSync(dataPath, before + ",\n" + newPostStr + "\n" + after, "utf-8");
}

export async function GET() {
  return NextResponse.json({
    message: "Menshlynews Article Generator API",
    usage: "POST with { title, category, excerpt }",
    categories: VALID_CATEGORIES,
  });
}
