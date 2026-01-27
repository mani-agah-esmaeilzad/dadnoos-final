export type RawUserInfo = {
    first_name?: string
    last_name?: string
    _id?: string
    phone?: string
    occupation_id?: string
    specialty_id?: string
    university_id?: string
    enterance_year?: string
    coins?: string | number
    created_at?: string
    updated_at?: string
    [key: string]: any
}

export type RenamedUserInfo = {
    firstName?: string
    lastName?: string
    id?: string
    mobile?: string
    occupationId?: string
    specialtyId?: string
    universityId?: string
    enteranceYear?: string
    coins?: string | number
    registerationTimestamp?: string
    updatedAt?: string
}

export function renameUserInfo(userInfo: RawUserInfo): RenamedUserInfo {
    const {
        first_name: firstName,
        last_name: lastName,
        _id: id,
        phone: mobile,
        occupation_id: occupationId,
        specialty_id: specialtyId,
        university_id: universityId,
        enterance_year: enteranceYear,
        coins,
        created_at: registerationTimestamp,
        updated_at: updatedAt,
    } = userInfo

    return {
        firstName,
        lastName,
        id,
        mobile,
        occupationId,
        specialtyId,
        universityId,
        enteranceYear,
        coins,
        registerationTimestamp,
        updatedAt,
    }
}

export function setUserInfo(userInfo: RawUserInfo): void {
    const renamed = renameUserInfo(userInfo)
    for (const [key, value] of Object.entries(renamed)) {
        if (value !== undefined) {
            localStorage.setItem(key, String(value))
        }
    }
}

export function getUserInfo(): RenamedUserInfo {
    const keys: (keyof RenamedUserInfo)[] = [
        'firstName',
        'lastName',
        'id',
        'mobile',
        'occupationId',
        'specialtyId',
        'universityId',
        'enteranceYear',
        'coins',
        'registerationTimestamp',
        'updatedAt',
    ]

    const user: RenamedUserInfo = {}
    for (const key of keys) {
        user[key] = localStorage.getItem(key) ?? undefined
    }
    return user
}

export function getUserFirstName(): string | null {
    return localStorage.getItem('firstName')
}

export function getUserLastName(): string | null {
    return localStorage.getItem('lastName')
}

export function getUserMobile(): string | null {
    return localStorage.getItem('mobile')
}

export function getUserRegisterationTimestamp(): string | null {
    return localStorage.getItem('registerationTimestamp')
}

export function clearStorage(): void {
    localStorage.clear()
}
