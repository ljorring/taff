export let success = <T>(result: T): { success: true, request: T } => ({
    success: true,
    request: result
})

export let fail = (errorMessage: string): { success: false, errorMessage: string } => ({
    success: false,
    errorMessage
})