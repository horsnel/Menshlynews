import { db } from '../src/lib/db';
import { posts } from '../src/lib/data';

async function seed() {
  console.log('Seeding database...');

  for (const post of posts) {
    const existing = await db.post.findUnique({ where: { slug: post.slug } });
    if (!existing) {
      await db.post.create({
        data: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          categoryIcon: '',
          image: post.image,
          author: post.author,
          date: post.date,
          readTime: post.readTime,
          featured: post.featured || false,
          likes: post.likes,
          shares: post.shares,
          tags: post.tags.join(','),
        },
      });
      console.log(`  Created: ${post.title}`);
    } else {
      // Update content fields but PRESERVE real like/share counts from the database
      await db.post.update({
        where: { slug: post.slug },
        data: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          image: post.image,
          readTime: post.readTime,
          featured: post.featured || false,
          tags: post.tags.join(','),
        },
      });
      console.log(`  Updated (preserved likes): ${post.title}`);
    }
  }

  console.log('Seeding complete!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
