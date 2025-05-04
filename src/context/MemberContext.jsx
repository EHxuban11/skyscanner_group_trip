// src/context/MemberContext.jsx
import React, { createContext, useState, useEffect } from 'react'

export const MemberContext = createContext({
  member: undefined,
  setMember: () => {},
  logout: () => {}
})

export function MemberProvider({ children }) {
  // undefined = loading, null = no user, {…} = somebody logged in
  const [member, setMember] = useState(undefined)

  // 1️⃣ On mount, load any saved member from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('member')
    if (saved) {
      setMember(JSON.parse(saved))
    } else {
      setMember(null)
    }
  }, [])

  // 2️⃣ Whenever `member` changes, persist or clear localStorage
  useEffect(() => {
    if (member) {
      localStorage.setItem('member', JSON.stringify(member))
    } else {
      localStorage.removeItem('member')
    }
  }, [member])

  // 3️⃣ logout() clears both context *and* localStorage
  const logout = () => {
    setMember(null)
    // localStorage is already cleared by the effect above when member → null
  }

  return (
    <MemberContext.Provider value={{ member, setMember, logout }}>
      {children}
    </MemberContext.Provider>
  )
}
