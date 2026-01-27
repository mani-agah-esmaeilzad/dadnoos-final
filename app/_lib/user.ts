import { useUserStore } from '@/app/_lib/hooks/store'
import { renameUserInfo } from '@/app/_lib/storage'
import { apiService } from '@/app/_lib/services/api'

import { clearStorage } from '@/app/_lib/storage'

export type UserInfo = {
    id?: number
    first_name?: string
    last_name?: string
    phone?: string
    [key: string]: any
}

export function storeUser(userInfo: UserInfo) {
    useUserStore.setState({ user: renameUserInfo(userInfo) })
}

export function removeUser() {
    useUserStore.setState({ user: {} })
}

export function getUserSearchQueryParams(query: string): string | null {
    const words = query.trim().split(' ')

    if (!words || words.length === 0) return null

    let params: string

    if (words.length === 1) {
        params = `first_name=&last_name=${words[0]}`
    } else {
        params = `first_name=${words[0]}&last_name=${words[words.length - 1]}`
    }

    return params
}

export function getUserFullName(firstName?: string, lastName?: string): string {
    return `${firstName ?? ''} ${lastName ?? ''}`.trim()
}

export async function logoutUser(): Promise<void> {
    apiService.setToken(null)
    clearStorage()
    removeUser()
}
