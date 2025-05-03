// src/Context/MemberContext.jsx
import React, { createContext, useState, useEffect } from 'react'

export const MemberContext = createContext()

export function MemberProvider({ children }) {
  const [member, setMember] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('currentMember')
    if (stored) {
      const parsed = JSON.parse(stored)
      setMember(parsed)
      console.log('Loaded member from localStorage:', parsed)
    }
  }, [])

  useEffect(() => {
    if (member) {
      localStorage.setItem('currentMember', JSON.stringify(member))
      console.log('Saved member to localStorage:', member)
    }
  }, [member])

  const logout = () => {
    setMember(null)
    localStorage.removeItem('currentMember')
    console.log('Logged out: member cleared from localStorage')
  }

  return (
    <MemberContext.Provider value={{ member, setMember, logout }}>
      {children}
    </MemberContext.Provider>
  )
}