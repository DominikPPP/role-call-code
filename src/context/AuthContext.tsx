'use client'

import React, { createContext, useState, useCallback, useEffect } from 'react'
import type { User } from '@/lib/types'
import { usersData, ALL_USERS_PASSWORD } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

/* ✅ PEŁNY TYP WNIOSKU URLOPOWEGO Z FINALNYM STATUSEM */
export interface LeaveRequest {
	employeeName: string
	employeePosition: string
	leaveType: string
	leaveStartDate: string
	leaveEndDate: string
	leaveDurationDays: string
	leaveSubstitute?: string
	requestDate: string
	status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'FINAL_APPROVED'
}

/* ✅ PEŁNY KONTEKST */
interface AuthContextType {
	user: User | null
	login: (username: string, password: string) => Promise<boolean>
	logout: () => void
	loading: boolean

	leaveRequest: LeaveRequest | null
	setLeaveRequest: (req: LeaveRequest | null) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	/* ✅ GLOBALNY WNIOSEK URLOPOWY */
	const [leaveRequestState, setLeaveRequestState] = useState<LeaveRequest | null>(null)

	const setLeaveRequest = (req: LeaveRequest | null) => {
		setLeaveRequestState(req)
		if (req) {
			localStorage.setItem('leaveRequest', JSON.stringify(req))
		} else {
			localStorage.removeItem('leaveRequest')
		}
	}

	useEffect(() => {
		try {
			const storedUser = localStorage.getItem('rolecall-user')
			if (storedUser) {
				setUser(JSON.parse(storedUser))
			}

			const storedLeave = localStorage.getItem('leaveRequest')
			if (storedLeave) {
				setLeaveRequestState(JSON.parse(storedLeave))
			}
		} catch (error) {
			console.error('Failed to parse data from localStorage', error)
			localStorage.removeItem('rolecall-user')
			localStorage.removeItem('leaveRequest')
		} finally {
			setLoading(false)
		}
	}, [])

	const login = useCallback(async (username: string, password: string) => {
		const userData = usersData[username.toLowerCase()]
		if (userData && password === ALL_USERS_PASSWORD) {
			const loggedInUser: User = { ...userData, username }
			setUser(loggedInUser)
			localStorage.setItem('rolecall-user', JSON.stringify(loggedInUser))
			return true
		}
		return false
	}, [])

	const logout = useCallback(() => {
		const loggedOutUser = user
		setUser(null)
		localStorage.removeItem('rolecall-user')
		if (loggedOutUser) {
			localStorage.removeItem(`avatar_${loggedOutUser.id}`)
		}
	}, [user])

	if (loading) {
		return (
			<div className='flex h-screen w-full items-center justify-center bg-background'>
				<Loader2 className='h-12 w-12 animate-spin text-primary' />
			</div>
		)
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				login,
				logout,
				loading,
				leaveRequest: leaveRequestState,
				setLeaveRequest,
			}}>
			{children}
		</AuthContext.Provider>
	)
}
