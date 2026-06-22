import { Suspense, lazy, Component } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'

const ProductsApp = lazy(() => import('products/ProductsApp'))
const CartApp = lazy(() => import('cart/CartApp'))

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return <div style={{ color: 'red', padding: '1rem' }}><b>Error:</b> {this.state.error.message}</div>
    }
    return this.props.children
  }
}

function Home() {
  return (
    <div className="home-hero">
      <h1>Welcome to the Shop</h1>
      <p>Browse our products and add them to your cart.</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        <NavLink to="/" className="brand">⚡ ShopMFE</NavLink>
        <div className="links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/cart">Cart</NavLink>
        </div>
      </nav>

      <main>
        <ErrorBoundary>
          <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--text)' }}>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductsApp />} />
              <Route path="/cart" element={<CartApp />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </BrowserRouter>
  )
}

export default App
