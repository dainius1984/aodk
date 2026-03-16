import React from 'react';

const BlogAdminArticleList = ({ articles, loading, onEdit, onNew, onDelete }) => (
  <section className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-800">Istniejące artykuły</h2>
      <button
        type="button"
        onClick={onNew}
        className="text-sm text-green-700 hover:underline"
      >
        + Nowy artykuł
      </button>
    </div>
    {loading ? (
      <p className="text-sm text-gray-500">Ładowanie artykułów...</p>
    ) : !articles?.length ? (
      <p className="text-sm text-gray-500">Brak artykułów w bazie.</p>
    ) : (
      <ul className="space-y-2 max-h-64 overflow-auto">
        {articles.map((article) => (
          <li
            key={article.slug}
            className="flex items-center justify-between gap-3 text-sm border border-gray-100 rounded-lg px-3 py-2 hover:bg-gray-50"
          >
            <div className="min-w-0">
              <div className="font-medium text-gray-800 truncate">
                {article.title || '(bez tytułu)'}
              </div>
              <div className="text-xs text-gray-500">
                {article.date} · {article.category} · slug: {article.slug}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => onEdit(article)}
                className="px-3 py-1 text-xs rounded-lg border border-green-600 text-green-700 hover:bg-green-50 whitespace-nowrap"
              >
                Edytuj
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(article.slug)}
                className="px-3 py-1 text-xs rounded-lg border border-red-500 text-red-600 hover:bg-red-50 whitespace-nowrap"
              >
                Usuń
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default BlogAdminArticleList;
