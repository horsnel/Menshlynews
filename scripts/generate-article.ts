#!/usr/bin/env npx tsx

/**
 * Article Generator for Menshlynews
 * 
 * Generates a complete blog article with:
 * - Full markdown content matching the Menshlynews format (2000+ words)
 * - Tables, blockquotes, HACKs, step-by-step workflows
 * - Comprehensive "Start This Weekend" section with check-ins
 * - AI-generated topic-relevant hero image
 * - Auto-insertion into data.ts
 * 
 * Usage:
 *   npx tsx scripts/generate-article.ts "Article Title" "Category" "Excerpt"
 *   npx tsx scripts/generate-article.ts "AI Drop Servicing Business" "Side Hustles" "How to build..."
 * 
 * Or see suggestions:
 *   npx tsx scripts/generate-article.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import ZAI from 'z-ai-web-dev-sdk';

// ─── Configuration ──────────────────────────────────────────────────────────

const VALID_CATEGORIES = ['Investing', 'Saving', 'Retirement', 'Crypto', 'Real Estate', 'Side Hustles'];

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

**Step 2: [Name] (Days X-Y)**
- [Specific action items]
- ✅ Check-in: [Verification point]

## Pricing: What to Charge
| Tier | Price | Includes | Best For |
|------|-------|----------|----------|
| [Name] | $X/mo | [Features] | [Target customer] |

> **HACK:** [Pricing psychology tip]

## Getting Clients / Customers
**Method 1: [Name] (X% conversion rate)**
[Detailed approach]

## Tricks and Hacks
> **HACK:** [Specific actionable tip] (repeat 3-5 times)

## The Real Numbers
| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| [Metric] | [Value] | [Value] | [Value] |

## What Nobody Warns You About
- [Honest warnings, 5-6 items]

## Start This Weekend
[Opening paragraph about why weekend execution matters]

**Pre-Weekend Checklist**
- ✅ [Items needed before Saturday]

**Saturday Morning (9 AM – 12 PM): [Focus Area]**
1. [Specific numbered steps]

❓ **Self-Check:** [Question to verify understanding]

**Saturday Afternoon (1 PM – 5 PM): [Focus Area]**
1. [Steps]

❓ **Self-Check:** [Question]

**Saturday Evening (7 PM – 9 PM): [Focus Area]**
1. [Steps]

❓ **Self-Check:** [Question]

**Sunday Morning (9 AM – 12 PM): [Focus Area]**
1. [Steps]

❓ **Self-Check:** [Question]

**Sunday Afternoon (1 PM – 5 PM): [Focus Area]**
1. [Steps]

**Week 1 Action Plan**
| Day | Task | Time | Expected Outcome |
|-----|------|------|-----------------|
| Monday | [Task] | [Time] | [Outcome] |

**First Month Milestones**
- **Week 1:** [Benchmark]
- **Week 2:** [Benchmark]
- **Week 3:** [Benchmark]
- **Week 4:** [Benchmark]

**Red Flags to Watch For**
- 🚩 [Warning sign 1]
- 🚩 [Warning sign 2]
- 🚩 [Warning sign 3]

**Your 30-Day Check-In Questions**
1. [Reflection question]
2. [Reflection question]
3. [Reflection question]
4. [Reflection question]
5. [Reflection question]
6. [Reflection question]

CRITICAL RULES:
- Minimum 2000 words total
- Every paragraph must be 3-5 sentences minimum
- Use markdown tables with | separators (they render properly with remark-gfm)
- Include > **HACK:** blockquotes throughout
- Use ✅ for check-ins and ❓ for self-check questions
- Include real tool names, prices, and URLs
- No emoji except ✅, ❓, 🚩 in the Start This Weekend section
- Write as if you've actually done this business and made money
- Be honest about failures and timelines
- The Start This Weekend section must be 800-1200 words by itself`;

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface GeneratedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  content: string;
  likes: number;
  shares: number;
  tags: string[];
}

// ─── Main Logic ─────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  
  let title: string, category: string, excerpt: string;
  
  if (args.length >= 3) {
    [title, category, excerpt] = args;
  } else {
    console.log('📝 Menshlynews Article Generator');
    console.log('================================\n');
    console.log('Usage: npx tsx scripts/generate-article.ts "Title" "Category" "Excerpt"');
    console.log(`Valid categories: ${VALID_CATEGORIES.join(', ')}\n`);
    
    const topics = [
      { title: 'AI-Powered Drop Servicing Business', category: 'Side Hustles', excerpt: 'How to build a $6K/month drop servicing agency using AI to fulfill client work while you focus on sales.' },
      { title: 'Selling Notion Templates for Passive Income', category: 'Saving', excerpt: 'The complete guide to creating and selling Notion templates that generate $3K/month on Gumroad and Etsy.' },
      { title: 'AI Stock Trading Bots for Beginners', category: 'Investing', excerpt: 'A realistic guide to using AI trading bots — what works, what doesn\'t, and how to start with $500.' },
      { title: 'Building a Paid Discord Community', category: 'Side Hustles', excerpt: 'How to build a $10K/month paid Discord community using AI for content and engagement automation.' },
      { title: 'Rental Arbitrage with AI Market Analysis', category: 'Real Estate', excerpt: 'Use AI tools to find underpriced rentals, sublet on Airbnb, and build a $8K/month rental arbitrage business.' },
      { title: 'Staking Cryptocurrency for Passive Yield', category: 'Crypto', excerpt: 'The beginner\'s guide to earning 5-15% APY through crypto staking — risks, strategies, and the best platforms.' },
    ];
    
    const random = topics[Math.floor(Math.random() * topics.length)];
    console.log('💡 Suggested topic:');
    console.log(`   npx tsx scripts/generate-article.ts "${random.title}" "${random.category}" "${random.excerpt}"\n`);
    process.exit(1);
  }
  
  if (!VALID_CATEGORIES.includes(category)) {
    console.error(`❌ Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    process.exit(1);
  }
  
  console.log(`\n🚀 Generating article: "${title}"`);
  console.log(`   Category: ${category}`);
  console.log(`   Excerpt: ${excerpt}\n`);
  
  // Step 1: Generate article content using AI
  console.log('📝 Step 1: Generating article content with AI...');
  let content = await generateContent(title, category, excerpt);
  let wordCount = content.split(/\s+/).length;
  console.log(`   ✅ Content generated: ${wordCount} words`);
  
  // Retry if too short
  if (wordCount < 1800) {
    console.log('   ⚠️  Content is under 2000 words, regenerating with length emphasis...');
    const retryContent = await generateContent(title, category, excerpt, true);
    const retryWords = retryContent.split(/\s+/).length;
    if (retryWords > wordCount) {
      content = retryContent;
      wordCount = retryWords;
      console.log(`   ✅ Retry better: ${wordCount} words`);
    }
  }
  
  // Step 2: Generate hero image
  console.log('\n🎨 Step 2: Generating hero image...');
  const imageFilename = `article-${Date.now()}.png`;
  const imagePath = join(process.cwd(), 'public', 'images', imageFilename);
  const imagePrompt = buildImagePrompt(title, category);
  
  let imageSuccess = false;
  try {
    execSync(`z-ai-generate -p "${imagePrompt.replace(/"/g, '\\"')}" -o "${imagePath}" -s 1344x768`, {
      stdio: 'pipe',
      timeout: 120000,
    });
    imageSuccess = true;
    console.log(`   ✅ Image saved: public/images/${imageFilename}`);
  } catch {
    console.log('   ⚠️  Image generation failed, will use Unsplash fallback');
  }
  
  // Step 3: Build the post object
  const postId = String(Date.now());
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  
  const readTime = `${Math.max(6, Math.ceil(wordCount / 250))} min read`;
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  const newPost: GeneratedPost = {
    id: postId,
    title,
    slug,
    excerpt,
    category,
    image: imageSuccess ? `/images/${imageFilename}` : `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop`,
    author: 'Horsnel John',
    date: dateStr,
    readTime,
    content,
    likes: Math.floor(Math.random() * 500) + 500,
    shares: Math.floor(Math.random() * 100) + 50,
    tags: extractTags(title, category),
  };
  
  // Step 4: Insert into data.ts
  console.log('\n📦 Step 3: Inserting article into data.ts...');
  insertPostIntoDataTs(newPost);
  console.log('   ✅ Article inserted into data.ts');
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Article generated successfully!');
  console.log('='.repeat(50));
  console.log(`   Title:    ${title}`);
  console.log(`   Category: ${category}`);
  console.log(`   Words:    ${wordCount}`);
  console.log(`   Read:     ${readTime}`);
  console.log(`   Image:    ${newPost.image}`);
  console.log(`   Slug:     ${slug}`);
  console.log('\n   Next steps:');
  console.log('   1. Review the article in src/lib/data.ts');
  console.log('   2. Run `npm run dev` to preview');
  console.log('   3. Commit and push to GitHub\n');
}

// ─── AI Content Generation ──────────────────────────────────────────────────

async function generateContent(title: string, category: string, excerpt: string, forceLonger = false): Promise<string> {
  const zai = await ZAI.create();
  
  const longerInstruction = forceLonger 
    ? '\n\nIMPORTANT: The previous attempt was too short. You MUST write at least 2500 words. Expand every section with more detail, more examples, more specific numbers. Add more HACK blockquotes. Make the Start This Weekend section at least 1200 words.' 
    : '';
  
  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: ARTICLE_FORMAT_INSTRUCTIONS + longerInstruction,
      },
      {
        role: 'user',
        content: `Write a complete article titled "${title}" in the category "${category}". The excerpt is: "${excerpt}". Follow the format exactly. Write at least 2000 words. Make the content specific, actionable, and based on real experience. Include markdown tables, HACK blockquotes, step-by-step workflows with check-ins, and a comprehensive Start This Weekend section.`,
      },
    ],
    temperature: 0.8,
    max_tokens: 8000,
  });
  
  return completion.choices[0]?.message?.content || '';
}

// ─── Image Prompt Builder ───────────────────────────────────────────────────

function buildImagePrompt(title: string, category: string): string {
  const prompts: Record<string, string> = {
    'Investing': 'Professional investment analysis workspace, laptop showing stock charts and portfolio dashboard, modern office with financial data on screens, warm editorial photography, high quality',
    'Saving': 'Smart saving and budgeting workspace, laptop with financial planning app, organized desk with calculator and notebooks, modern clean style, editorial photography',
    'Retirement': 'Relaxed retirement planning scene, tablet showing retirement calculator, peaceful home office with warm lighting, comfortable lifestyle, editorial photography style',
    'Crypto': 'Cryptocurrency trading setup, multiple monitors showing blockchain data and crypto charts, modern fintech workspace with dark mode interfaces, editorial style',
    'Real Estate': 'Real estate investment workspace, laptop showing property listings and market analysis, modern desk with architectural models, professional editorial photography',
    'Side Hustles': 'Modern side hustle workspace, laptop with multiple income stream dashboards, creative desk setup with coffee and notes, entrepreneurial editorial photography style',
  };
  
  return prompts[category] || 'Professional workspace with laptop and modern desk setup, editorial photography style, high quality';
}

// ─── Tag Extraction ─────────────────────────────────────────────────────────

function extractTags(title: string, category: string): string[] {
  const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  const stopWords = new Set(['a', 'an', 'the', 'for', 'and', 'or', 'in', 'on', 'to', 'with', 'using', 'how', 'your', 'from']);
  const meaningful = words.filter(w => w.length > 3 && !stopWords.has(w));
  const tags = meaningful.slice(0, 3);
  if (!tags.includes(category.toLowerCase())) {
    tags.push(category.toLowerCase());
  }
  return tags.slice(0, 4);
}

// ─── Data.ts Insertion ──────────────────────────────────────────────────────

function insertPostIntoDataTs(post: GeneratedPost): void {
  const dataPath = join(process.cwd(), 'src', 'lib', 'data.ts');
  
  if (!existsSync(dataPath)) {
    console.error('❌ data.ts not found at', dataPath);
    process.exit(1);
  }
  
  let data = readFileSync(dataPath, 'utf-8');
  
  // Escape backticks and dollar signs in content for template literal
  const escapedContent = post.content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
  
  // Build the new post entry
  const newPostStr = `  {
    id: "${post.id}",
    title: "${post.title.replace(/"/g, '\\"')}",
    slug: "${post.slug}",
    excerpt: "${post.excerpt.replace(/"/g, '\\"')}",
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
  
  // Find the last post in the array and insert after it
  const lastPostEnd = data.lastIndexOf('  }\n];');
  
  if (lastPostEnd === -1) {
    console.error('❌ Could not find insertion point in data.ts');
    process.exit(1);
  }
  
  const before = data.slice(0, lastPostEnd);
  const after = data.slice(lastPostEnd);
  
  const newData = before + ',\n' + newPostStr + '\n' + after;
  
  writeFileSync(dataPath, newData, 'utf-8');
}

// ─── Run ────────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
