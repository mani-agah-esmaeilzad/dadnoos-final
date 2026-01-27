import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
    id?: string
    name?: string
    mobile?: string
    [key: string]: any
}

interface UserStore {
    user: User
    updateUser: (updatedFields: Partial<User>) => void
    removeUser: () => void
}

const initialUser: User = {}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: initialUser,
            updateUser: (updatedFields: Partial<User>) =>
                set((state) => ({
                    user: { ...state.user, ...updatedFields }
                })),
            removeUser: () => set({ user: initialUser }),
        }),
        {
            name: 'user',
            storage: createJSONStorage(() => localStorage),
        }
    )
)