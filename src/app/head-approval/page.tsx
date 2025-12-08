'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase' // ✅ używasz tego samego importu co wcześniej

type LeaveRequest = {
	id: string
	employeeName: string
	employeePosition: string
	leaveType: string
	leaveStartDate: string
	leaveEndDate: string
	leaveDurationDays: string
	leaveSubstitute: string
	requestDate: string
	status: string
}

export default function HeadApprovalPage() {
	const { user } = useAuth()
	const router = useRouter()
	const [leaveRequest, setLeaveRequest] = useState<LeaveRequest | null>(null)
	const [loading, setLoading] = useState(true)

	// ✅ DOSTĘP TYLKO DLA HOLLY
	if (!user || user.roleCode !== 'Head of O.U.') {
		return (
			<div className='p-6 text-center text-red-500 font-semibold'>
				Access denied – this view is only for Holly Head.
			</div>
		)
	}

	// ✅ POBRANIE WNIOSKU Z FIRESTORE
	useEffect(() => {
		const fetchLeaveRequest = async () => {
			const snapshot = await getDocs(collection(db, 'leaveRequests'))
			const docs = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data(),
			})) as LeaveRequest[]

			const submitted = docs.find(r => r.status === 'SUBMITTED')
			setLeaveRequest(submitted || null)
			setLoading(false)
		}

		fetchLeaveRequest()
	}, [])

	// ✅ BRAK WNIOSKU
	if (loading) {
		return <div className='p-6 text-center'>Loading...</div>
	}

	if (!leaveRequest) {
		return <div className='p-6 text-center text-muted-foreground'>No leave request to review.</div>
	}

	// ✅ APPROVE → UPDATE W FIRESTORE
	const handleApprove = async () => {
		const ref = doc(db, 'leaveRequests', leaveRequest.id)
		await updateDoc(ref, {
			status: 'APPROVED',
		})

		alert('Leave request approved and forwarded to HR.')
		router.push('/dashboard')
	}

	// ✅ REJECT → UPDATE W FIRESTORE
	const handleReject = async () => {
		const ref = doc(db, 'leaveRequests', leaveRequest.id)
		await updateDoc(ref, {
			status: 'REJECTED',
		})

		alert('Leave request rejected.')
		router.push('/dashboard')
	}

	return (
		<div className='container mx-auto p-6 max-w-2xl'>
			<Card>
				<CardHeader>
					<CardTitle>Leave Request – Head Approval</CardTitle>
				</CardHeader>
				<CardContent className='space-y-3'>
					<p>
						<b>Employee:</b> {leaveRequest.employeeName}
					</p>
					<p>
						<b>Position:</b> {leaveRequest.employeePosition}
					</p>
					<p>
						<b>Leave Type:</b> {leaveRequest.leaveType}
					</p>
					<p>
						<b>Start Date:</b> {leaveRequest.leaveStartDate}
					</p>
					<p>
						<b>End Date:</b> {leaveRequest.leaveEndDate}
					</p>
					<p>
						<b>Duration (days):</b> {leaveRequest.leaveDurationDays}
					</p>
					<p>
						<b>Substitute:</b> {leaveRequest.leaveSubstitute || '—'}
					</p>
					<p>
						<b>Request Date:</b> {leaveRequest.requestDate}
					</p>
					<p>
						<b>Status:</b> {leaveRequest.status}
					</p>

					<div className='flex gap-4 pt-4'>
						<Button onClick={handleApprove} className='w-full'>
							Approve
						</Button>
						<Button onClick={handleReject} variant='destructive' className='w-full'>
							Reject
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
