import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  imagePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CreateLink,
} from '@mdxeditor/editor';

import '@mdxeditor/editor/style.css';

import {
  getArticle,
  createArticle,
  updateArticle,
  uploadImage,
} from '../api/articles';

function NewArticle() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  const editorRef = useRef(null);

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

        setTitle(article.title || '');
        setCategory(article.category || '');
        setDescription(article.description || '');

        const articleContent = article.content || '';

        setContent(articleContent);

        // MDXEditor nie jest w pełni controlled component.
        // Ustawiamy zawartość bezpośrednio po pobraniu artykułu.
        editorRef.current?.setMarkdown(articleContent);
      } catch (error) {
        console.error('Failed to fetch article:', error);
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
      console.error('Failed to save article:', error);
      alert('Failed to save article');
    }
  }

  async function handleImageUpload(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      const sizeInMb = (file.size / 1024 / 1024).toFixed(1);

      alert(
        `Image is too large (${sizeInMb} MB).\nMaximum allowed size is 5 MB.`
      );

      event.target.value = '';
      return;
    }

    try {
      const data = await uploadImage(file);

      /*
       * Nowy obraz zapisujemy jako zwykły Markdown.
       *
       * MDXEditor imagePlugin obsługuje ten format:
       *
       * ![filename](url)
       *
       * Jeżeli później zmienimy rozmiar obrazu w edytorze,
       * MDXEditor zapisze go jako <img> z width/height.
       */
      const markdown = `![${file.name}](${data.url})`;

      editorRef.current?.insertMarkdown(
        `\n\n${markdown}\n\n`
      );
    } catch (error) {
      console.error('Failed to upload image:', error);
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

        {/* ========================= */}
        {/* EDITOR */}
        {/* ========================= */}

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

              <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Category"
              />

              <div className="image-upload">

                <label
                  htmlFor="image-upload"
                  className="image-upload-button"
                >
                  Add image
                </label>

                <input
                  id="image-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageUpload}
                  hidden
                />

              </div>

            </div>

            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short description"
            />

          </div>

          <div className="markdown-editor">

            <MDXEditor
              ref={editorRef}
              markdown={content}
              onChange={setContent}
              plugins={[

                headingsPlugin(),

                listsPlugin(),

                quotePlugin(),

                thematicBreakPlugin(),

                markdownShortcutPlugin(),

                /*
                 * Obsługa obrazów:
                 *
                 * - Markdown images
                 * - HTML <img>
                 * - resize obrazów
                 * - ustawienia obrazu
                 */
                imagePlugin(),

                toolbarPlugin({
                  toolbarContents: () => (
                    <>
                      <UndoRedo />

                      <BoldItalicUnderlineToggles />

                      <CreateLink />
                    </>
                  ),
                }),

              ]}
            />

          </div>

        </section>

        {/* ========================= */}
        {/* PREVIEW */}
        {/* ========================= */}

        <section className="preview-panel">

          <div className="preview-header">
            <span>PREVIEW</span>
          </div>

          <article className="article-preview">

            {title && (
              <h1>{title}</h1>
            )}

            {description && (
              <p className="preview-description">
                {description}
              </p>
            )}

            {category && (
              <span className="category">
                {category}
              </span>
            )}

            <div className="article-content">

              {content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{

                    img: ({ node, ...props }) => (
                      <img
                        {...props}
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          display: 'block',
                        }}
                      />
                    ),

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