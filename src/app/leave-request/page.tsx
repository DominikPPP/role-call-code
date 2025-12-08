'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function LeaveRequestPage() {
	const { user, setLeaveRequest } = useAuth() // ✅ DODANE setLeaveRequest
	const router = useRouter()

	const [form, setForm] = useState({
		employeeName: user?.name || '',
		employeePosition: '',
		leaveType: '',
		leaveStartDate: '',
		leaveEndDate: '',
		leaveDurationDays: '',
		leaveSubstitute: '',
		requestDate: new Date().toISOString().split('T')[0],
	})

	const handleChange = (e: any) => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	const handleSubmit = (e: any) => {
		e.preventDefault()

		// ✅ ZAPIS DO GLOBALNEGO STANU (DLA HOLLY HEAD)
		setLeaveRequest({
			...form,
			status: 'SUBMITTED',
		})

		console.log('Leave request submitted:', form)

		alert('Leave request submitted successfully!')

		// ✅ POWRÓT NA DASHBOARD
		router.push('/dashboard')
	}

	if (!user) return null

	return (
		<div className='container mx-auto p-6 max-w-2xl'>
			<Card>
				<CardHeader>
					<CardTitle>Leave Request</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<Label>Employee Name</Label>
							<Input name='employeeName' value={form.employeeName} disabled />
						</div>

						<div>
							<Label>Employee Position</Label>
							<Input name='employeePosition' onChange={handleChange} required />
						</div>

						<div>
							<Label>Leave Type</Label>
							<Input name='leaveType' placeholder='e.g. Recreational' onChange={handleChange} required />
						</div>

						<div>
							<Label>Leave Start Date</Label>
							<Input type='date' name='leaveStartDate' onChange={handleChange} required />
						</div>

						<div>
							<Label>Leave End Date</Label>
							<Input type='date' name='leaveEndDate' onChange={handleChange} required />
						</div>

						<div>
							<Label>Leave Duration Days</Label>
							<Input name='leaveDurationDays' onChange={handleChange} required />
						</div>

						<div>
							<Label>Leave Substitute (optional)</Label>
							<Input name='leaveSubstitute' onChange={handleChange} />
						</div>

						<div>
							<Label>Request Date</Label>
							<Input value={form.requestDate} disabled />
						</div>

						<Button type='submit' className='w-full'>
							Submit Leave Request
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
