import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import {
  getArticle,
  createArticle,
  updateArticle,
  uploadImage
} from '../api/articles';

function NewArticle() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);


  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    async function fetchArticle() {
      try {
        const article = await getArticle(id);

        setTitle(article.title);
        setCategory(article.category);
        setDescription(article.description || '');
        setContent(article.content);
      } catch (error) {
        console.error(error);
      }
    }

    fetchArticle();
  }, [id, isEditMode]);


  async function handleSubmit(event) {
    event.preventDefault();

    const articleData = {
      title,
      category,
      description,
      content,
    };

    try {
      if (isEditMode) {
        await updateArticle(id, articleData);
      } else {
        await createArticle(articleData);
      }

      navigate('/');
    } catch (error) {
      console.error(error);
    }
  }
  const [imageWidth, setImageWidth] = useState('100%');

  async function handleImageUpload(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    try {
      const data = await uploadImage(file);

      const width = window.prompt(
        'Image width: 25, 50, 75 or 100',
        '100'
      );

      const selectedWidth = ['25', '50', '75', '100'].includes(width)
        ? width
        : '100';

      const markdown = `![image](${data.url} "width=${selectedWidth}%")`;

      setContent((currentContent) => {
        if (currentContent.length === 0) {
          return markdown;
        }

        return `${currentContent}\n\n${markdown}`;
      });
    } catch (error) {
      console.error(error);
      alert('Failed to upload image');
    } finally {
      event.target.value = '';
    }
  }
  return (
    <main className="editor-page">
      <div className="editor-topbar">
        <Link to="/" className="editor-back">
          ← All notes
        </Link>

        <div className="editor-actions">
          <span className="editor-status">
            {isEditMode ? 'Editing' : 'Draft'}
          </span>

          <button
            type="submit"
            form="article-form"
            className="save-button"
          >
            {isEditMode ? 'Update article' : 'Save article'}
          </button>
        </div>
      </div>

      <form
        id="article-form"
        className="editor"
        onSubmit={handleSubmit}
      >
        <section className="editor-panel">
          <input
            className="editor-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Article title"
          />

          <div className="editor-meta">
            <div className="editor-meta-row">
              <input type="text" value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Category" />
              <div className="image-upload">
                <label htmlFor="image-upload"
                  className="image-upload-button" > Add image
                </label>
                <input id="image-upload" type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageUpload} hidden />
              </div>
            </div>
            <input type="text" value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short description" />
          </div>

          <textarea
            className="markdown-editor"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={`# Start writing...

Use Markdown for your notes.

## Example

\`\`\`java
Map<String, Integer> map = new HashMap<>();
\`\`\``}
          />
        </section>

        <section className="preview-panel">
          <div className="preview-header">
            <span>PREVIEW</span>
          </div>

          <article className="article-preview">
            {title && <h1>{title}</h1>}

            {description && (
              <p className="preview-description">
                {description}
              </p>
            )}

            {category && (
              <span className="category">{category}</span>
            )}

            <div className="article-content">
              {content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: ({ node, ...props }) => {
                      const title = props.title || '';
                      const match = title.match(/width=(\d+)%/);

                      const width = match ? `${match[1]}%` : '100%';

                      return (
                        <img
                          {...props}
                          title={undefined}
                          style={{
                            width,
                            maxWidth: '100%',
                            height: 'auto',
                          }}
                        />
                      );
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <div className="empty-preview">
                  Your article preview will appear here.
                </div>
              )}
            </div>
          </article>
        </section>
      </form>
    </main>
  );
}

export default NewArticle;