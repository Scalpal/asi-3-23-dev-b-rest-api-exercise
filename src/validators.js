import * as yup from "yup"

// generic
export const boolValidator = yup.bool()
export const stringValidator = yup.string().min(1)
export const idValidator = yup.number().integer().min(1)

// pages
export const titleValidator = yup.string().min(1).max(300)
export const contentValidator = yup.string().min(1)
export const slugValidator = yup.string().min(1)
export const statusValidator = yup.string().lowercase().oneOf(["draft", "published"])

// users
export const lastNameValidator = yup.string().min(1)
export const firstNameValidator = yup.string().min(1)
export const emailValidator = yup.string().email()
export const passwordValidator = yup.string().min(8)
export const roleValidator = yup.number()

// navigationMenu
// export const parentIdValidator = yup.number()

// collection (pagination, order, etc.)
export const limitValidator = yup.number().integer().min(1).max(100).default(5)

export const pageValidator = yup.number().integer().min(1).default(1)

export const orderFieldValidator = (fields) => yup.string().oneOf(fields)

export const orderValidator = yup.string().lowercase().oneOf(["asc", "desc"])
