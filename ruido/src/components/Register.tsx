import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const Register: React.FC = () => {
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' })
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(form)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="username" placeholder="Username" value={form.username} onChange={handleChange} className="bg-gray-800 border-gray-700 text-white" />
            <Input name="displayName" placeholder="Display name" value={form.displayName} onChange={handleChange} className="bg-gray-800 border-gray-700 text-white" />
            <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="bg-gray-800 border-gray-700 text-white" />
            <Input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="bg-gray-800 border-gray-700 text-white" />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
            <p className="text-gray-400 text-sm text-center">
              Already have an account? <Link to="/login" className="text-purple-500">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Register
