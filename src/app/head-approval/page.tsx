'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HeadApprovalPage() {
	const { user, leaveRequest, setLeaveRequest } = useAuth()
	const router = useRouter()

	// ✅ TYLKO HOLLY HEAD MA DOSTĘP
	if (!user || user.roleCode !== 'Head of O.U.') {
		return (
			<div className='p-6 text-center text-red-500 font-semibold'>
				Access denied – this view is only for Holly Head.
			</div>
		)
	}

	// ✅ JEŚLI NIE MA WNIOSKU
	if (!leaveRequest) {
		return <div className='p-6 text-center text-muted-foreground'>No leave request to review.</div>
	}

	// ✅ PRZEKAZANIE DO HR
	const handleApprove = () => {
		setLeaveRequest({
			...leaveRequest,
			status: 'APPROVED',
		})

		alert('Leave request forwarded to HR (Penny Personnel).')
		router.push('/dashboard')
	}

	// ✅ ODRZUCENIE
	const handleReject = () => {
		setLeaveRequest({
			...leaveRequest,
			status: 'REJECTED',
		})

		alert('Leave request rejected by Holly Head.')
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
