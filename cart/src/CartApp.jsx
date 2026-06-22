import { useSyncExternalStore } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'
import store from './store/store'
import { setTotal, setStatus } from './store/checkoutSlice'

function CartList() {
  const dispatch = useDispatch()
  const { total, status } = useSelector(state => state.checkout)

  const cartItems = useSyncExternalStore(
    (callback) => {
      const unsub = window.__productsStore.subscribe(callback)
      return unsub
    },
    () => window.__productsStore.getState().cart.items
  )

  const handleCheckout = () => {
    const sum = cartItems.reduce((acc, item) => acc + item.price, 0)
    dispatch(setTotal(sum))
    dispatch(setStatus('checked-out'))
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Cart ({cartItems.length} items)</h2>

      {cartItems.length === 0 ? (
        <div style={{
          border: '1px dashed var(--border)',
          borderRadius: '10px',
          padding: '3rem',
          color: 'var(--text)',
          textAlign: 'center',
        }}>
          🛒 Your cart is empty
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cartItems.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--bg)',
            }}>
              <span style={{ color: 'var(--text-h)', fontWeight: 500 }}>🛍️ {item.name}</span>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>${item.price}</span>
            </div>
          ))}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
            borderTop: '2px solid var(--border)',
            fontWeight: 600,
            color: 'var(--text-h)',
            marginTop: '0.25rem',
          }}>
            <span>Subtotal</span>
            <span>${cartItems.reduce((sum, i) => sum + i.price, 0)}</span>
          </div>

          {status !== 'checked-out' ? (
            <button
              onClick={handleCheckout}
              style={{
                padding: '0.75rem',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '1rem',
                marginTop: '0.5rem',
              }}
            >
              Checkout
            </button>
          ) : (
            <div style={{
              padding: '1rem',
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)',
              borderRadius: '8px',
              color: 'var(--accent)',
              fontWeight: 600,
              textAlign: 'center',
              marginTop: '0.5rem',
            }}>
              ✅ Order placed! Total: ${total}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CartApp() {
  return (
    <Provider store={store}>
      <CartList />
    </Provider>
  )
}

export default CartApp