import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Container from '../components/ui/Container'
import Icon from '../components/layout/Icon'
import { useAuthStore } from '../store/authStore'
import { useOrderStore } from '../store/orderStore'

function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const isRegister = location.pathname === '/register'
  const account = useAuthStore((state) => state.account)
  const register = useAuthStore((state) => state.register)
  const login = useAuthStore((state) => state.login)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  if (account) return <Navigate replace to="/account" />

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const success = isRegister ? register(name, email) : login(email)
    if (!success) {
      setError(isRegister ? 'An account with that email already exists in this browser.' : 'No demo account was found. Register first to create one here.')
      return
    }
    navigate('/account', { replace: true })
  }

  return (
    <Container className="account-page auth-page">
      <section className="auth-card">
        <p className="destination-page__eyebrow">{isRegister ? 'JOIN THE BUILD' : 'WELCOME BACK'}</p>
        <h1>{isRegister ? 'Create your account' : 'Sign in'}<span>.</span></h1>
        <p>This is demo-only local profile storage. No password is requested or stored, and this is not secure authentication.</p>
        <form onSubmit={submit}>
          {isRegister && <label>Your name<input autoComplete="name" onChange={(event) => setName(event.target.value)} required value={name} /></label>}
          <label>Email address<input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="ui-button ui-button--primary" type="submit">{isRegister ? 'Create demo account' : 'Continue with email'} <Icon name="arrow" /></button>
        </form>
        <p className="auth-card__switch">{isRegister ? 'Already registered in this browser?' : 'New to PCForge?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
        <Link className="auth-card__back" to="/shop">Continue browsing without an account</Link>
      </section>
    </Container>
  )
}

function Account() {
  const account = useAuthStore((state) => state.account)
  const logout = useAuthStore((state) => state.logout)
  const orders = useOrderStore((state) => state.orders)
  if (!account) return <Navigate replace to="/login" />

  return (
    <Container className="account-page account-home">
      <header className="destination-page__header"><p className="destination-page__eyebrow">YOUR PCFORGE ACCOUNT</p><h1>Welcome, {account.name.split(/\s+/)[0]}<span>.</span></h1><p>{account.email}</p></header>
      <div className="account-actions-grid">
        <Link to="/orders"><span>ORDERS</span><strong>{orders.length} saved {orders.length === 1 ? 'order' : 'orders'}</strong><p>Review purchases and delivery estimates.</p><Icon name="arrow" /></Link>
        <Link to="/track-order"><span>TRACKING</span><strong>Find an order</strong><p>Look up a saved order ID.</p><Icon name="arrow" /></Link>
      </div>
      <button className="ui-button ui-button--outline account-logout" onClick={logout} type="button">Sign out</button>
      <p className="help-page__fineprint">This demo profile is stored in this browser only. It does not control access to orders or services.</p>
    </Container>
  )
}

export { AuthPage }
export default Account
