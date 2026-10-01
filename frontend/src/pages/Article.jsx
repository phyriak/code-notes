import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getArticle,
  deleteArticle,
} from '../api/articles';

function Article() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    async function fetchArticle() {
      try {
        const data = await getArticle(id);
        setArticle(data);
      } catch (error) {
        console.error(error);
        setError('Article not found');
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <main>
        <p>Loading article...</p>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main>
        <h2>Article not found</h2>

        <Link className="article-back" to="/">
          ← Back to articles
        </Link>
      </main>
    );
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      'Are you sure you want to delete this article?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteArticle(id);
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Failed to delete article');
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }


  return (
    <main>
      <div className="article-actions">
        <Link to="/">← Back to articles</Link>

        <div className="article-buttons">
          <Link
            to={`/articles/${article.id}/edit`}
            className="edit-button"
          >
            Edit
          </Link>

          <button
            type="button"
            className="delete-button"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>

      <article className="article-page">
        <span className="category">{article.category}</span>

        <h1>{article.title}</h1>

        <p>{article.description}</p>

        <div className="article-meta">
          <span>
            Created {formatDate(article.created_at)}
          </span>

          <span>
            Updated {formatDate(article.updated_at)}
          </span>
        </div>

        <hr />

        <div className="article-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}


export default Article;