import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getArticles } from '../api/articles';

function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const [search, setSearch] = useState('');

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      !selectedCategory ||
      article.category === selectedCategory;

    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      article.title.toLowerCase().includes(searchText) ||
      article.description?.toLowerCase().includes(searchText) ||
      article.content.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    async function fetchArticles() {
      try {
        const data = await getArticles();
        setArticles(data);
      } catch (error) {
        console.error(error);
        setError('Failed to load articles');
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <main>
        <p>Loading articles...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main>
      <div className="home-header">
        <div>
          <h2>
            {selectedCategory || 'My notes'}
          </h2>
          <p>
            {selectedCategory
              ? `Articles about ${selectedCategory}.`
              : 'Technical knowledge I have collected.'}
          </p>
        </div>

        <Link to="/articles/new" className="new-article-button">
          + New article
        </Link>
      </div>

      <input
        className="search"
        type="text"
        placeholder="Search notes..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <section className="articles">
        {filteredArticles.length === 0 ? (
          <div className="no-results">
            No articles found.
          </div>
        ) : (
          filteredArticles.map((article) => (
            <Link
              to={`/articles/${article.id}`}
              className="article-card"
              key={article.id}
            >
              <span className="category">
                {article.category}
              </span>

              <h3>{article.title}</h3>

              <p>{article.description}</p>

              <div className="article-date">
                Updated {formatDate(article.updated_at)}
              </div>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default Home;