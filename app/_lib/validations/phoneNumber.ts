const iranPhoneNumberRegExp = /^(?:\+98|0)?9\d{9}$/

export function validateIranPhone(phone: string): boolean {
    return iranPhoneNumberRegExp.test(phone)
}