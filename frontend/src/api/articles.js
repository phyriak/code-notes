const API_URL = '/api';

export async function getArticles() {
  const response = await fetch(`${API_URL}/articles`);

  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }

  return response.json();
}

export async function getArticle(id) {
  const response = await fetch(`${API_URL}/articles/${id}`);

  if (!response.ok) {
    throw new Error('Article not found');
  }

  return response.json();
}

export async function createArticle(article) {
  const response = await fetch(`${API_URL}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(article),
  });

  if (!response.ok) {
    throw new Error('Failed to create article');
  }

  return response.json();
}

export async function updateArticle(id, article) {
  const response = await fetch(`${API_URL}/articles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(article),
  });

  if (!response.ok) {
    throw new Error('Failed to update article');
  }

  return response.json();
}

export async function deleteArticle(id) {
  const response = await fetch(`${API_URL}/articles/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete article');
  }
}

export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`);

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/images`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  return response.json();
}