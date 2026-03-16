import supabase from '../lib/supabase-browser';

/**
 * Blog service for fetching blog articles from Supabase
 */
const blogService = {
  /**
   * Get all blog articles
   * @returns {Promise<Array>} Array of blog articles sorted by date (newest first)
   */
  getAllArticles: async () => {
    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching blog articles:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Exception when fetching blog articles:', err);
      return [];
    }
  },

  /**
   * Get single blog article by slug
   * @param {string} slug - Article slug
   * @returns {Promise<Object|null>} Article object or null if not found
   */
  getArticleBySlug: async (slug) => {
    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        console.error(`Error fetching article with slug ${slug}:`, error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error(`Exception when fetching article with slug ${slug}:`, err);
      return null;
    }
  },

  /**
   * Get articles by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} Array of articles in the category
   */
  getArticlesByCategory: async (category) => {
    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('category', category)
        .order('date', { ascending: false });
      
      if (error) {
        console.error(`Error fetching articles for category ${category}:`, error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error(`Exception when fetching articles for category ${category}:`, err);
      return [];
    }
  },

  /**
   * Get related articles by slugs
   * @param {Array<string>} slugs - Array of article slugs
   * @returns {Promise<Array>} Array of related articles
   */
  getRelatedArticles: async (slugs) => {
    if (!slugs || slugs.length === 0) return [];
    
    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('slug, title, excerpt, image, date, category, author')
        .in('slug', slugs);
      
      if (error) {
        console.error('Error fetching related articles:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Exception when fetching related articles:', err);
      return [];
    }
  },

  /**
   * Create a new blog article (for admin use).
   * Requires RLS to allow INSERT on blog_articles (e.g. for authenticated users).
   * @param {Object} article - { title, slug, date, category, excerpt, author, content, image?, related_articles? }
   * @returns {Promise<{ data: object | null, error: object | null }>}
   */
  createArticle: async (article) => {
    const payload = {
      title: article.title,
      slug: article.slug,
      date: article.date,
      category: article.category,
      excerpt: article.excerpt,
      author: article.author,
      content: article.content,
      ...(article.image && { image: article.image }),
      ...(article.related_articles && { related_articles: article.related_articles }),
    };
    const { data, error } = await supabase
      .from('blog_articles')
      .insert(payload)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Update an existing blog article by slug (for admin use).
   * Requires RLS to allow UPDATE on blog_articles.
   * @param {string} slug - Existing article slug (original)
   * @param {Object} article - Fields to update
   * @returns {Promise<{ data: object | null, error: object | null }>}
   */
  updateArticle: async (slug, article) => {
    const payload = {
      title: article.title,
      slug: article.slug,
      date: article.date,
      category: article.category,
      excerpt: article.excerpt,
      author: article.author,
      content: article.content,
      ...(article.image && { image: article.image }),
      ...(article.related_articles && { related_articles: article.related_articles }),
    };

    const { data, error } = await supabase
      .from('blog_articles')
      .update(payload)
      .eq('slug', slug)
      .select()
      .single();

    return { data, error };
  },

  /**
   * Delete a blog article by slug (for admin use).
   * @param {string} slug
   * @returns {Promise<{ data: object | null, error: object | null }>}
   */
  deleteArticle: async (slug) => {
    const { data, error } = await supabase
      .from('blog_articles')
      .delete()
      .eq('slug', slug)
      .select()
      .maybeSingle();

    return { data, error };
  },
};

export default blogService;
