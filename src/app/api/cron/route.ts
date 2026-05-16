import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { execSync } from 'child_process';
import { join } from 'path';

const VALID_CATEGORIES = ['Investing', 'Saving', 'Retirement', 'Crypto', 'Real Estate', 'Side Hustles'];

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = 'google/gemini-2.0-flash-001';

const CRON_SECRET = process.env.CRON_SECRET || 'menshly-wire-cron-2024';

// Pool of trending topics for auto-generation — rotates through categories
const TOPIC_POOL = [
  { title: 'AI-Powered Drop Servicing Business', category: 'Side Hustles', excerpt: 'How to build a $6K/month drop servicing agency using AI to fulfill client work while you focus on sales.' },
  { title: 'Selling Notion Templates for Passive Income', category: 'Saving', excerpt: 'The complete guide to creating and selling Notion templates that generate $3K/month on Gumroad and Etsy.' },
  { title: 'AI Stock Trading Bots for Beginners', category: 'Investing', excerpt: 'A realistic guide to using AI trading bots — what works, what doesn\'t, and how to start with $500.' },
  { title: 'Building a Paid Discord Community', category: 'Side Hustles', excerpt: 'How to build a $10K/month paid Discord community using AI for content and engagement automation.' },
  { title: 'Rental Arbitrage with AI Market Analysis', category: 'Real Estate', excerpt: 'Use AI tools to find underpriced rentals, sublet on Airbnb, and build a $8K/month rental arbitrage business.' },
  { title: 'Staking Cryptocurrency for Passive Yield', category: 'Crypto', excerpt: 'The beginner\'s guide to earning 5-15% APY through crypto staking — risks, strategies, and the best platforms.' },
  { title: 'AI Newsletter That Prints Money', category: 'Side Hustles', excerpt: 'How to start an AI-curated newsletter from scratch and grow it to $5K/month in sponsorships within 6 months.' },
  { title: 'Micro-Investing Apps That Actually Work', category: 'Investing', excerpt: 'The truth about micro-investing apps — which ones build real wealth and which ones just drain your spare change.' },
  { title: 'Fire Movement 2.0 with AI Automation', category: 'Retirement', excerpt: 'How AI tools are reinventing the FIRE movement — automate your savings, investments, and path to early retirement.' },
  { title: 'DeFi Yield Strategies for 2025', category: 'Crypto', excerpt: 'Advanced DeFi yield strategies that go beyond basic staking — liquidity pools, yield aggregators, and risk management.' },
  { title: 'House Hacking with AI Property Analysis', category: 'Real Estate', excerpt: 'How to use AI-powered property analysis to find the perfect house hack — live for free while building equity.' },
  { title: 'AI Freelance Writing Business', category: 'Side Hustles', excerpt: 'Build a $7K/month freelance writing business using AI as your research assistant — not your replacement.' },
  { title: 'Emergency Fund Automation Guide', category: 'Saving', excerpt: 'Set up a fully automated emergency fund system that builds itself while you sleep — no willpower required.' },
  { title: 'Dividend Investing with AI Screening', category: 'Investing', excerpt: 'How to use AI stock screeners to build a dividend portfolio that generates $2K/month in passive income.' },
  { title: 'Roth IRA Maximization Strategies', category: 'Retirement', excerpt: 'Advanced Roth IRA strategies that most people miss — backdoor conversions, mega backdoor, and AI-optimized allocation.' },
  { title: 'NFT Royalty Income Streams', category: 'Crypto', excerpt: 'Creating and selling NFT collections with built-in royalties that generate recurring income on every resale.' },
  { title: 'Airbnb Co-Hosting Business Model', category: 'Real Estate', excerpt: 'How to start an Airbnb co-hosting business managing other people\'s properties for $4K/month without owning real estate.' },
  { title: 'AI Print-on-Demand Empire', category: 'Side Hustles', excerpt: 'Building a print-on-demand business with AI-generated designs that earns $5K/month across multiple platforms.' },
  { title: 'Tax Optimization with AI Tools', category: 'Saving', excerpt: 'How AI tax tools can save you $3K-8K per year — legitimate deductions and strategies most people miss.' },
  { title: 'Real Estate Crowdfunding Platforms Compared', category: 'Real Estate', excerpt: 'An honest comparison of real estate crowdfunding platforms — returns, risks, and which ones are worth your money.' },
];

const ARTICLE_FORMAT_INSTRUCTIONS = `You are writing for Menshly Wire, a financial education blog targeted at young men who want to build real income streams. Write in first person, conversational tone, like a friend who's actually done this and made money from it. Be specific with real numbers, tool names, and URLs. No fluff, no filler, no generic advice — only actionable content.

MANDATORY FORMAT — Follow this structure EXACTLY. Do NOT skip any section:

## [Compelling Section Title — relate to the topic]
[Opening paragraph — 4-6 sentences minimum. Start with a personal story, surprising statistic, or compelling hook. Make the reader feel like you understand their situation.]

## Why This Works Right Now
[3-5 paragraphs about market timing, trends, and opportunity. Include specific numbers: market size, growth rates, year-over-year changes. Reference real platforms and tools. Make the reader feel urgency without being scammy.]

## The Realistic Picture
[5 truth blockquotes — each one an honest reality check:]
> **Truth #1:** [honest reality check about effort required — 2-3 sentences]
> **Truth #2:** [honest reality check about income timeline]
> **Truth #3:** [honest reality check about competition or difficulty]
> **Truth #4:** [honest reality check about costs or risks]
> **Truth #5:** [honest reality check about what "success" really looks like]

## The Free Stack
[Describe 4-6 free tools in detail. Each tool gets 2-3 sentences explaining how to use it specifically for this business. Include HACK blockquotes:]
> **HACK:** [specific power-user tip — exact steps, not vague advice]

## The Paid Stack
[Markdown table with 4-6 paid tools:]
| Tool | Cost | Purpose | Free Alternative |
|------|------|---------|-----------------|
| [Tool Name] | $X/mo | [What it does specifically] | [Free tool name] |
| **Total** | **$X/mo** | | |

> **HACK:** [How to get a discount or free trial — be specific]

## The Workflow: Step-by-Step
**Step 1: [Name] (Day X)**
[2-3 paragraphs of detailed instructions]
- [Specific action items with exact steps]
- ✅ Check-in: [What should be verified at this point — measurable outcome]

**Step 2: [Name] (Days X-Y)**
[2-3 paragraphs of detailed instructions]
- [Specific action items]
- ✅ Check-in: [Verification point]

**Step 3: [Name] (Days X-Y)**
[2-3 paragraphs]
- [Specific action items]
- ✅ Check-in: [Verification point]

**Step 4: [Name] (Day X+)**
[2-3 paragraphs about scaling or optimization]
- [Specific action items]
- ✅ Check-in: [Verification point]

## Pricing: What to Charge
| Tier | Price | Includes | Best For |
|------|-------|----------|----------|
| Starter | $X | [Features — be specific] | [Target customer type] |
| Pro | $X | [Features] | [Target customer] |
| Premium | $X | [Features] | [Target customer] |

> **HACK:** [Pricing psychology tip — specific technique with explanation]

## Getting Clients / Customers
**Method 1: [Name] (X% conversion rate)**
[3-4 sentences with detailed approach, platforms, and scripts]

**Method 2: [Name] (X% conversion rate)**
[3-4 sentences with detailed approach]

**Method 3: [Name] (X% conversion rate)**
[3-4 sentences with detailed approach]

> **HACK:** [Client acquisition trick — specific and actionable]

## Tricks and Hacks
> **HACK:** [Specific actionable tip with step-by-step — not vague advice] (repeat 4-5 times, each one different and specific)

## Monthly Revenue Projections
| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Revenue | $X | $X | $X |
| Clients/Customers | X | X | X |
| Hours/Week | X | X | X |
| Profit Margin | X% | X% | X% |

## What Nobody Warns You About
- [Honest warning — 2-3 sentences explaining the risk and how to mitigate it]
- [Honest warning — same detail level]
- [Honest warning]
- [Honest warning]
- [Honest warning]
- [Honest warning]

## Start This Weekend
[Opening paragraph — 4-6 sentences about why weekend execution matters, why waiting kills momentum, and how this weekend is the perfect time to start. Make it motivational but realistic.]

**Pre-Weekend Checklist**
- ✅ [Item 1 — specific tool/account to set up with URL]
- ✅ [Item 2 — specific research or preparation]
- ✅ [Item 3 — specific mindset or commitment]
- ✅ [Item 4 — specific resource to gather]
- ✅ [Item 5 — specific financial preparation]

**Saturday Morning (9 AM – 12 PM): [Focus Area]**
[2-3 paragraphs of detailed instructions for this session]
1. [Specific step with exact actions]
2. [Specific step]
3. [Specific step]
4. [Specific step]
5. [Specific step]

❓ **Self-Check:** [Question to verify understanding]

**Saturday Afternoon (1 PM – 5 PM): [Focus Area]**
[2-3 paragraphs of detailed instructions]
1. [Specific step]
2. [Specific step]
3. [Specific step]
4. [Specific step]

❓ **Self-Check:** [Question]

**Saturday Evening (7 PM – 9 PM): [Focus Area]**
[2-3 paragraphs of detailed instructions for review and planning]
1. [Specific step]
2. [Specific step]
3. [Specific step]

❓ **Self-Check:** [Question]

**Sunday Morning (9 AM – 12 PM): [Focus Area]**
[2-3 paragraphs of detailed instructions]
1. [Specific step]
2. [Specific step]
3. [Specific step]
4. [Specific step]

❓ **Self-Check:** [Question]

**Sunday Afternoon (1 PM – 5 PM): [Focus Area — Launch/Go-Live]**
[2-3 paragraphs about getting your first result, first client, or first sale]
1. [Specific step]
2. [Specific step]
3. [Specific step]
4. [Specific step]

**Week 1 Action Plan**
| Day | Task | Time | Expected Outcome |
|-----|------|------|-----------------|
| Monday | [Specific task] | [Time] | [Measurable outcome] |
| Tuesday | [Specific task] | [Time] | [Measurable outcome] |
| Wednesday | [Specific task] | [Time] | [Measurable outcome] |
| Thursday | [Specific task] | [Time] | [Measurable outcome] |
| Friday | [Specific task] | [Time] | [Measurable outcome] |

**First Month Milestones**
- **Week 1:** [Specific benchmark]
- **Week 2:** [Specific benchmark]
- **Week 3:** [Specific benchmark]
- **Week 4:** [Specific benchmark]

**Red Flags to Watch For**
- 🚩 [Warning sign 1]
- 🚩 [Warning sign 2]
- 🚩 [Warning sign 3]
- 🚩 [Warning sign 4]

**Your 30-Day Check-In Questions**
1. [Reflection question]
2. [Reflection question]
3. [Reflection question]
4. [Reflection question]
5. [Reflection question]
6. [Reflection question]

CRITICAL RULES:
- Minimum 2500 words total (aim for 3000+)
- Every paragraph must be 3-5 sentences minimum — NO single-sentence paragraphs
- Use markdown tables with | separators (they render properly with remark-gfm)
- Include > **HACK:** blockquotes throughout (at least 8 total)
- Use ✅ for check-ins and ❓ for self-check questions
- Include real tool names, real prices, and real URLs where possible
- No emoji except ✅, ❓, 🚩 in the Start This Weekend section
- Write as if you've actually done this business and made real money from it
- Be honest about failures, timelines, and effort required
- The Start This Weekend section must be 1000-1500 words by itself
- Each "Step" in the Workflow section must have at least 2 paragraphs
- All numbers in tables must be realistic and consistent`;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

function buildImagePrompt(title: string, category: string): string {
  const categoryBase: Record<string, string> = {
    'Investing': 'investment analysis workspace with stock charts, portfolio dashboard, financial data screens',
    'Saving': 'smart budgeting workspace with financial planning app, savings tracker, organized desk',
    'Retirement': 'retirement planning scene with investment calculator, peaceful lifestyle, warm lighting',
    'Crypto': 'cryptocurrency trading setup with blockchain data, crypto charts, dark mode fintech interfaces',
    'Real Estate': 'real estate workspace with property listings, market analysis, architectural elements',
    'Side Hustles': 'entrepreneurial workspace with multiple income dashboards, laptop, creative desk setup',
  };
  const base = categoryBase[category] || 'professional workspace with laptop and modern desk';
  return `Professional editorial photography of ${base}, warm ambient lighting, depth of field, high quality, 16:9 aspect ratio, magazine-style composition, clean modern aesthetic`;
}

function extractTags(title: string, category: string): string[] {
  const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  const stopWords = new Set(['a', 'an', 'the', 'for', 'and', 'or', 'in', 'on', 'to', 'with', 'using', 'how', 'your', 'from', 'build', 'start', 'make', 'guide', 'beginners', 'complete']);
  const meaningful = words.filter(w => w.length > 3 && !stopWords.has(w));
  const tags = meaningful.slice(0, 3);
  if (!tags.includes(category.toLowerCase())) tags.push(category.toLowerCase());
  return tags.slice(0, 4);
}

function insertPostIntoDataTs(post: Record<string, unknown>): void {
  const { readFileSync, writeFileSync, existsSync } = require('fs');
  const dataPath = join(process.cwd(), 'src', 'lib', 'data.ts');
  if (!existsSync(dataPath)) return;

  let data = readFileSync(dataPath, 'utf-8');
  const escapedContent = String(post.content)
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

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
    featured: false,
    content: \`${escapedContent}\`
  }`;

  const lastPostEnd = data.lastIndexOf('  }\n];');
  if (lastPostEnd === -1) return;

  const before = data.slice(0, lastPostEnd);
  const after = data.slice(lastPostEnd);
  writeFileSync(dataPath, before + ',\n' + newPostStr + '\n' + after, 'utf-8');
}

async function generateContent(title: string, category: string, excerpt: string, forceLonger = false): Promise<string> {
  const longerInstruction = forceLonger
    ? '\n\nIMPORTANT: The previous attempt was too short. You MUST write at least 3000 words. Expand every section with more detail, more examples, more specific numbers. Add more HACK blockquotes. Make the Start This Weekend section at least 1500 words. Every paragraph must be 4-6 sentences.'
    : '';

  const userMessage = `Write a complete article titled "${title}" in the category "${category}". The excerpt is: "${excerpt}". Follow the MANDATORY FORMAT exactly. Write at least 2500 words (aim for 3000+). Make the content specific, actionable, and based on real experience. Include markdown tables with | separators, HACK blockquotes (at least 8), step-by-step workflows with check-ins, and a comprehensive Start This Weekend section (1000-1500 words). Every paragraph must be 3-5 sentences minimum.`;

  // Try z-ai-web-dev-sdk first
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: ARTICLE_FORMAT_INSTRUCTIONS + longerInstruction },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 8000,
    });
    const content = completion.choices[0]?.message?.content || '';
    if (content.length > 500) return content;
    throw new Error('Content too short from z-ai-web-dev-sdk');
  } catch (err) {
    console.error('z-ai-web-dev-sdk failed:', (err as Error).message);
  }

  // Fallback to OpenRouter
  if (!OPENROUTER_API_KEY) {
    throw new Error('z-ai-web-dev-sdk failed and no OPENROUTER_API_KEY set');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://menshlywire.com',
      'X-Title': 'Menshly Wire Cron Generator',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: ARTICLE_FORMAT_INSTRUCTIONS + longerInstruction },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  if (content.length < 500) {
    throw new Error('Content too short from OpenRouter');
  }
  return content;
}

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '') || '';
    const urlSecret = new URL(request.url).searchParams.get('secret') || '';

    if (providedSecret !== CRON_SECRET && urlSecret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Pick the next topic based on the current date (rotates through pool)
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % TOPIC_POOL.length;
    const topic = TOPIC_POOL[dayIndex];

    return generateAndInsert(topic);
  } catch (error) {
    console.error('Cron generation error:', error);
    return NextResponse.json(
      { error: 'Cron generation failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function generateAndInsert(topic: { title: string; category: string; excerpt: string }) {
  console.log(`Cron: Generating article "${topic.title}"...`);

  // Generate content
  let content = await generateContent(topic.title, topic.category, topic.excerpt);
  let wordCount = content.split(/\s+/).length;

  if (wordCount < 2000) {
    try {
      const retryContent = await generateContent(topic.title, topic.category, topic.excerpt, true);
      const retryWords = retryContent.split(/\s+/).length;
      if (retryWords > wordCount) {
        content = retryContent;
        wordCount = retryWords;
      }
    } catch { /* Use first attempt */ }
  }

  // Generate hero image
  const slug = slugify(topic.title);
  const imagePrompt = buildImagePrompt(topic.title, topic.category);
  const imageFilename = `ai-${slug}.jpg`;
  const imagePath = join(process.cwd(), 'public', 'images', imageFilename);

  let imageUrl = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop';
  try {
    execSync(
      `z-ai-generate -p "${imagePrompt.replace(/"/g, '\\"')}" -o "${imagePath}" -s 1344x768`,
      { stdio: 'pipe', timeout: 120000 }
    );
    imageUrl = `/images/${imageFilename}`;
  } catch { /* Fallback to Unsplash */ }

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const tags = extractTags(topic.title, topic.category);

  const post = {
    id: String(Date.now()),
    title: topic.title,
    slug,
    excerpt: topic.excerpt,
    category: topic.category,
    image: imageUrl,
    author: 'Horsnel John',
    date: dateStr,
    readTime: `${Math.max(6, Math.ceil(wordCount / 250))} min read`,
    likes: Math.floor(Math.random() * 500) + 500,
    shares: Math.floor(Math.random() * 100) + 50,
    tags,
    content,
  };

  // Insert into data.ts only
  insertPostIntoDataTs(post);

  console.log(`Cron: Article "${topic.title}" generated (${wordCount} words)`);

  return NextResponse.json({
    success: true,
    generated: true,
    post: {
      id: post.id,
      title: topic.title,
      slug,
      category: topic.category,
      wordCount,
      readTime: post.readTime,
      image: imageUrl,
    },
  });
}

export async function GET() {
  return NextResponse.json({
    message: 'Menshly Wire Cron Article Generator',
    usage: 'POST with Authorization: Bearer <CRON_SECRET> or ?secret=<CRON_SECRET>',
    topicPoolSize: TOPIC_POOL.length,
    secretRequired: true,
  });
}
