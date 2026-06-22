import { Provider, useDispatch } from 'react-redux'
import store from './store/store'
import { addItem } from './store/cartSlice'

const products = [
  { id: 1, name: 'Wireless Headphones', price: 99 },
  { id: 2, name: 'Mechanical Keyboard', price: 149 },
  { id: 3, name: 'USB-C Hub', price: 49 },
]

function ProductsList() {
  const dispatch = useDispatch()

  const handleAddToCart = (product) => {
    dispatch(addItem(product))
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Products</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {products.map(product => (
          <div key={product.id} style={{
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: 'var(--bg)',
            boxShadow: 'var(--shadow)',
          }}>
            <div style={{ fontSize: '2rem' }}>🛍️</div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.25rem' }}>{product.name}</div>
              <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.1rem' }}>${product.price}</div>
            </div>
            <button
              onClick={() => handleAddToCart(product)}
              style={{
                marginTop: 'auto',
                padding: '0.5rem 1rem',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductsApp() {
  return (
    <Provider store={store}>
      <ProductsList />
    </Provider>
  )
}

export default ProductsApp