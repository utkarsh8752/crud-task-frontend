import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

// Single axios client. Adjust baseURL if your backend lives elsewhere.
const api = axios.create({ baseURL: '/api' })
const PAGE_SIZE = 10

function App() {
  const [categories, setCategories] = useState([])
  const [catName, setCatName] = useState('')
  const [editingCatId, setEditingCatId] = useState(null)
  const [editingCatName, setEditingCatName] = useState('')

  const [products, setProducts] = useState([])
  const [productForm, setProductForm] = useState({ name: '', categoryId: '' })
  const [editingProdId, setEditingProdId] = useState(null)
  const [editingProdForm, setEditingProdForm] = useState({ name: '', categoryId: '' })
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadCategories()
    loadProducts(1)
  }, [])

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories')
      setCategories(data || [])
    } catch (err) {
      console.error('Category load failed', err)
    }
  }

  const loadProducts = async (targetPage = 1) => {
    try {
      const { data } = await api.get('/products', {
        params: { page: targetPage, limit: PAGE_SIZE },
      })
      setProducts(data?.data || [])
      setPage(data?.page || 1)
      setPages(data?.pages || 1)
      setTotal(data?.total || 0)
    } catch (err) {
      console.error('Product load failed', err)
    }
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!catName.trim()) return
    try {
      await api.post('/categories', { name: catName.trim() })
      setCatName('')
      loadCategories()
    } catch (err) {
      console.error('Create category failed', err)
    }
  }

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`)
      loadCategories()
      loadProducts(page)
    } catch (err) {
      console.error('Delete category failed', err)
    }
  }

  const handleStartEditCategory = (cat) => {
    setEditingCatId(cat._id)
    setEditingCatName(cat.name)
  }

  const handleUpdateCategory = async (e) => {
    e.preventDefault()
    if (!editingCatId || !editingCatName.trim()) return
    try {
      await api.put(`/categories/${editingCatId}`, { name: editingCatName.trim() })
      setEditingCatId(null)
      setEditingCatName('')
      loadCategories()
      loadProducts(page)
    } catch (err) {
      console.error('Update category failed', err)
    }
  }

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    if (!productForm.name.trim() || !productForm.categoryId) return
    try {
      await api.post('/products', {
        name: productForm.name.trim(),
        categoryId: productForm.categoryId,
      })
      setProductForm({ name: '', categoryId: '' })
      loadProducts(page)
    } catch (err) {
      console.error('Create product failed', err)
    }
  }

  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`)
      const nextPage = products.length === 1 && page > 1 ? page - 1 : page
      loadProducts(nextPage)
    } catch (err) {
      console.error('Delete product failed', err)
    }
  }

  const handleStartEditProduct = (prod) => {
    setEditingProdId(prod._id)
    setEditingProdForm({
      name: prod.name,
      categoryId: prod.categoryId?._id || '',
    })
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    if (!editingProdId || !editingProdForm.name.trim() || !editingProdForm.categoryId) return
    try {
      await api.put(`/products/${editingProdId}`, {
        name: editingProdForm.name.trim(),
        categoryId: editingProdForm.categoryId,
      })
      setEditingProdId(null)
      setEditingProdForm({ name: '', categoryId: '' })
      loadProducts(page)
    } catch (err) {
      console.error('Update product failed', err)
    }
  }

  return (
    <div className="page">
      <main className="two-col">
        <section className="panel">
          <h2>Categories</h2>
          <form className="form" onSubmit={handleCreateCategory}>
            <input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="Category name"
            />
            <button type="submit">Add</button>
          </form>
          <ul className="simple-list">
            {categories.length === 0 && <li className="muted">No categories yet.</li>}
            {categories.map((cat) => (
              <li key={cat._id}>
                {editingCatId === cat._id ? (
                  <form className="form" onSubmit={handleUpdateCategory}>
                    <input
                      value={editingCatName}
                      onChange={(e) => setEditingCatName(e.target.value)}
                      placeholder="Category name"
                    />
                    <div className="btn-row">
                      <button type="submit">Save</button>
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => {
                          setEditingCatId(null)
                          setEditingCatName('')
                        }}
                      >
                        cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <strong>{cat.name}</strong>
                    </div>
                    <div className="btn-row">
                      <button
                        className="link-btn"
                        type="button"
                        onClick={() => handleStartEditCategory(cat)}
                      >
                        edit
                      </button>
                      <button
                        className="link-btn"
                        type="button"
                        onClick={() => handleDeleteCategory(cat._id)}
                      >
                        delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Products</h2>
          <form className="form" onSubmit={handleCreateProduct}>
            <input
              value={productForm.name}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Product name"
            />
            <select
              value={productForm.categoryId}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, categoryId: e.target.value }))
              }
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button type="submit">Add</button>
          </form>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ProductId</th>
                  <th>ProductName</th>
                  <th>CategoryName</th>
                  <th>CategoryId</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr>
                    <td colSpan="5" className="muted center">No products yet.</td>
                  </tr>
                )}
                {products.map((prod) => (
                  <tr key={prod._id}>
                    <td>{prod._id}</td>
                    {editingProdId === prod._id ? (
                      <>
                        <td>
                          <input
                            value={editingProdForm.name}
                            onChange={(e) =>
                              setEditingProdForm((f) => ({ ...f, name: e.target.value }))
                            }
                            placeholder="Product name"
                          />
                        </td>
                        <td>
                          <select
                            value={editingProdForm.categoryId}
                            onChange={(e) =>
                              setEditingProdForm((f) => ({ ...f, categoryId: e.target.value }))
                            }
                          >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat._id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>{editingProdForm.categoryId || '-'}</td>
                        <td>
                          <div className="btn-row">
                            <button type="button" onClick={handleUpdateProduct}>
                              Save
                            </button>
                            <button
                              className="link-btn"
                              type="button"
                              onClick={() => {
                                setEditingProdId(null)
                                setEditingProdForm({ name: '', categoryId: '' })
                              }}
                            >
                              cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{prod.name}</td>
                        <td>{prod.categoryId?.name || '-'}</td>
                        <td>{prod.categoryId?._id || '-'}</td>
                        <td>
                          <div className="btn-row">
                            <button
                              className="link-btn"
                              type="button"
                              onClick={() => handleStartEditProduct(prod)}
                            >
                              edit
                            </button>
                            <button
                              className="link-btn"
                              type="button"
                              onClick={() => handleDeleteProduct(prod._id)}
                            >
                              delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pager">
            <button
              type="button"
              onClick={() => loadProducts(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>
            <span>
              Page {page} / {pages} - {total} total
            </span>
            <button
              type="button"
              onClick={() => loadProducts(Math.min(pages, page + 1))}
              disabled={page >= pages}
            >
              Next
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
