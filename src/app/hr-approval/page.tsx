'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HrApprovalPage() {
	const { user, leaveRequest, setLeaveRequest } = useAuth()
	const router = useRouter()

	// 🔐 Dostęp tylko dla Penny Personnel (PD)
	if (!user || user.roleCode !== 'PD') {
		return (
			<div className='p-6 text-center text-red-500 font-semibold'>
				Access denied — this view is only for Penny Personnel.
			</div>
		)
	}

	// ⛔ Brak wniosku
	if (!leaveRequest) {
		return <div className='p-6 text-center text-muted-foreground'>No leave request available for HR.</div>
	}

	// ⛔ Wniosek nie jest jeszcze zatwierdzony przez Holly
	if (leaveRequest.status !== 'APPROVED') {
		return <div className='p-6 text-center text-muted-foreground'>Waiting for Head of O.U. approval.</div>
	}

	// ✅ Finalna akceptacja HR
	const handleFinalApprove = () => {
		setLeaveRequest({
			...leaveRequest,
			status: 'FINAL_APPROVED',
		})

		alert('Leave request fully approved by HR.')
		router.push('/dashboard')
	}

	return (
		<div className='container mx-auto p-6 max-w-2xl'>
			<Card>
				<CardHeader>
					<CardTitle>Leave Request — HR Final Approval</CardTitle>
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
						<b>Duration:</b> {leaveRequest.leaveDurationDays} days
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

					<div className='pt-4'>
						<Button onClick={handleFinalApprove} className='w-full'>
							Final Approve (HR)
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
