import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import blogService from '../../../services/blogService';
import { blocksToHtml, htmlToBlocks } from '../../../utils/blogContentUtils';
import BlogAdminLogin from './BlogAdminLogin';
import BlogAdminArticleList from './BlogAdminArticleList';
import BlogAdminArticleForm from './BlogAdminArticleForm';
import BlogArticlePreview from './BlogArticlePreview';

const emptyForm = () => ({
  title: '',
  slug: '',
  date: new Date().toISOString().slice(0, 10),
  category: 'Dieta',
  excerpt: '',
  author: 'Marta Chmielnicka',
  image: '/img/Blog/',
  relatedSlugs: '',
});

/**
 * Admin page: list articles, create/edit with block editor.
 * Route: /admin/blog. Editing loads article content as blocks (same UI as create).
 */
const BlogAdminPage = () => {
  const [status, setStatus] = useState({ type: null, message: '' });
  const [isAuthed, setIsAuthed] = useState(false);
  const [login, setLogin] = useState({ username: '', password: '' });
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage?.getItem('blogAdminAuthed') === 'true') {
      setIsAuthed(true);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoadingArticles(true);
      const list = await blogService.getAllArticles();
      setArticles(list || []);
      setLoadingArticles(false);
    };
    if (isAuthed) load();
  }, [isAuthed]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLogin((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (login.username === 'admin' && login.password === 'Martusia84!') {
      setIsAuthed(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('blogAdminAuthed', 'true');
      }
      setStatus({ type: null, message: '' });
    } else {
      setStatus({ type: 'error', message: 'Nieprawidłowy login lub hasło.' });
    }
  };

  const setFormField = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const startNewArticle = () => {
    setEditingSlug(null);
    setForm(emptyForm());
    setBlocks([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditArticle = (article) => {
    setEditingSlug(article.slug);
    setForm({
      title: article.title || '',
      slug: article.slug || '',
      date: article.date || new Date().toISOString().slice(0, 10),
      category: article.category || '',
      excerpt: article.excerpt || '',
      author: article.author || '',
      image: article.image || '',
      relatedSlugs: Array.isArray(article.related_articles)
        ? article.related_articles.join(', ')
        : '',
    });
    setBlocks(htmlToBlocks(article.content || ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });
    const isEditing = Boolean(editingSlug);

    const confirmed = window.confirm(
      isEditing
        ? 'Czy na pewno chcesz zapisać zmiany w artykule?'
        : 'Czy na pewno chcesz opublikować nowy artykuł?'
    );
    if (!confirmed) return;

    const content = blocksToHtml(blocks);
    const related_articles = form.relatedSlugs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      title: form.title,
      slug: form.slug,
      date: form.date,
      category: form.category,
      excerpt: form.excerpt,
      author: form.author,
      content,
      image: form.image || undefined,
      related_articles: related_articles.length ? related_articles : undefined,
    };

    const { data, error } = isEditing
      ? await blogService.updateArticle(editingSlug, payload)
      : await blogService.createArticle(payload);

    if (error) {
      setStatus({ type: 'error', message: error.message || 'Błąd zapisu' });
      return;
    }
    setStatus({
      type: 'success',
      message: isEditing
        ? 'Artykuł zaktualizowany. Slug: ' + data?.slug
        : 'Artykuł dodany. Slug: ' + data?.slug,
    });

    const list = await blogService.getAllArticles();
    setArticles(list || []);

    if (isEditing) {
      setEditingSlug(null);
    }
    setBlocks([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1920px] mx-auto flex flex-col xl:flex-row xl:items-start xl:gap-8">
        {/* Left: admin form and list */}
        <div className="xl:min-w-0 xl:max-w-3xl xl:flex-shrink-0 w-full">
          <Link to="/blog" className="text-green-600 hover:text-green-700 font-medium mb-6 inline-block">
            ← Wróć do bloga
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Panel bloga (admin)</h1>

          {isAuthed && (
            <p className="mb-6 text-sm text-gray-600">
              {editingSlug
                ? `Tryb edycji artykułu: ${editingSlug}`
                : 'Tryb dodawania nowego artykułu.'}{' '}
              {editingSlug && (
                <button
                  type="button"
                  onClick={startNewArticle}
                  className="ml-2 text-green-700 hover:underline"
                >
                  + Nowy artykuł
                </button>
              )}
            </p>
          )}

          {status.message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                status.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
              }`}
            >
              {status.message}
            </div>
          )}

          {!isAuthed ? (
            <BlogAdminLogin
              login={login}
              onLoginChange={handleLoginChange}
              onSubmit={handleLoginSubmit}
              status={status}
            />
          ) : (
            <>
              <BlogAdminArticleList
                articles={articles}
                loading={loadingArticles}
                onEdit={startEditArticle}
                onNew={startNewArticle}
                onDelete={async (slug) => {
                  if (!window.confirm('Czy na pewno chcesz trwale usunąć ten artykuł?')) return;
                  const { error } = await blogService.deleteArticle(slug);
                  if (error) {
                    setStatus({ type: 'error', message: error.message || 'Nie udało się usunąć artykułu.' });
                    return;
                  }
                  const list = await blogService.getAllArticles();
                  setArticles(list || []);
                  if (editingSlug === slug) {
                    setEditingSlug(null);
                    setForm(emptyForm());
                    setBlocks([]);
                  }
                  setStatus({ type: 'success', message: 'Artykuł został usunięty.' });
                }}
              />
              <BlogAdminArticleForm
                form={form}
                onFormChange={setFormField}
                blocks={blocks}
                onBlocksChange={setBlocks}
                onSubmit={handleSubmit}
                isEditing={Boolean(editingSlug)}
                slugHint={!editingSlug}
              />
            </>
          )}
        </div>

        {/* Right: live preview of article page (header + content + footer) */}
        {isAuthed && (
          <aside className="xl:sticky xl:top-8 xl:w-[min(100%,520px)] xl:flex-shrink-0 mt-10 xl:mt-0">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
              Podgląd artykułu
            </div>
            <div className="max-h-[calc(100vh-6rem)] xl:overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              <BlogArticlePreview form={form} blocks={blocks} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default BlogAdminPage;
