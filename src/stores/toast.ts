import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
    id: number
    message: string
    type: ToastType
    timeout?: number
}

let toastId = 0

export const useToastStore = defineStore('toast', {
    state: () => ({
        toasts: [] as Toast[]
    }),
    actions: {
        show(message: string, type: ToastType = 'info', timeout = 3000) {
            const id = ++toastId
            this.toasts.push({ id, message, type, timeout })
            if (timeout > 0) {
                setTimeout(() => this.removeToast(id), timeout)
            }
        },
        success(message: string, timeout = 3000) {
            this.show(message, 'success', timeout)
        },
        error(message: string, timeout = 3000) {
            this.show(message, 'error', timeout)
        },
        info(message: string, timeout = 3000) {
            this.show(message, 'info', timeout)
        },
        warning(message: string, timeout = 3000) {
            this.show(message, 'warning', timeout)
        },
        removeToast(id: number) {
            this.toasts = this.toasts.filter(t => t.id !== id)
        }
    }
})
