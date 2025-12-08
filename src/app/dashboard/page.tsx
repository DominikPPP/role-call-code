'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
	const { user } = useAuth()
	const router = useRouter()
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
	const [isLoadingAvatar, setIsLoadingAvatar] = useState(true)

	const getInitials = (name: string) => {
		if (!name) return ''
		const names = name.split(' ')
		if (names.length > 1) {
			return `${names[0][0]}${names[names.length - 1][0]}`
		}
		return name.substring(0, 2).toUpperCase()
	}

	useEffect(() => {
		if (user) {
			setIsLoadingAvatar(true)
			const finalAvatarUrl = `https://picsum.photos/seed/${user.id}/128/128`
			setAvatarUrl(finalAvatarUrl)
			localStorage.setItem(`avatar_${user.id}`, finalAvatarUrl)
			setIsLoadingAvatar(false)
		}
	}, [user])

	if (!user) {
		return null
	}

	return (
		<div className='container mx-auto p-4 sm:p-6 lg:p-8'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
				<p className='text-muted-foreground'>Welcome back, {user.name}!</p>
			</div>

			<Card className='mx-auto max-w-2xl shadow-lg'>
				<CardHeader>
					<CardTitle>Your Profile</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex flex-col items-center gap-6 sm:flex-row'>
						{isLoadingAvatar || !avatarUrl ? (
							<Skeleton className='h-32 w-32 rounded-full' />
						) : (
							<Avatar className='h-32 w-32 border-4 border-primary/20'>
								<AvatarImage src={avatarUrl ?? undefined} alt={user.name} />
								<AvatarFallback className='text-4xl'>{getInitials(user.name)}</AvatarFallback>
							</Avatar>
						)}
						<div className='space-y-2 text-center sm:text-left'>
							<h2 className='text-2xl font-semibold'>{user.name}</h2>
							<p className='text-lg text-muted-foreground'>{user.role}</p>
							<p className='text-sm text-muted-foreground'>Username: {user.username}</p>
							<p className='text-sm text-muted-foreground'>Role Code: {user.roleCode}</p>

							{/* ✅ ALICE – składanie wniosku */}
							{user.roleCode === 'AT' && (
								<div className='pt-4'>
									<Button onClick={() => router.push('/leave-request')}>Apply for Leave</Button>
								</div>
							)}

							
							{/* PRZYCISK DO STARTOWANIA PROCESSU DECORATIONS & MEDALS */}
							{user.roleCode === 'Head of O.U.' && (
								<div className='pt-4'>
									<Button onClick={() => router.push('/flows/decorations-and-medals/start')}>
										Start Decorations and Medals
									</Button>
								</div>
							)}

						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
