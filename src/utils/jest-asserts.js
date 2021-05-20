const { expect } = global

/**
* Return Promise from passed interaction
* @param {function | Promise} ix - Promise or function to wrap
* @returns Promise<*>
* */
export const promise = async (ix) => {
	if (typeof ix === "function") {
		return await ix()
	}
	return await ix
}

/**
 * Ensure transaction did not throw and sealed.
 * @param {function | Promise} ix - Promise or function to wrap
 * @returns Promise<*> - transaction result
 * */
export const shallPass = async (ix) => {
	const tx = promise(ix)
	await expect(
		(async () => {
			const { status, errorMessage } = await tx
			expect(status).toBe(4)
			expect(errorMessage).toBe("")
		})()
	).resolves.not.toThrow()

	return tx
}

/**
 * Ensure interaction did not throw and return result of it
 * @param {function | Promise} ix - Promise or function to wrap
 * @returns Promise<*> - result of interaction
 * */
export const shallResolve = async (ix) => {
	const wrappedInteraction = promise(ix)
	await expect(promise(wrappedInteraction)).resolves.not.toThrow()

	return wrappedInteraction
}

/**
 * Ensure interaction throws an error.
 * @param {function | Promise} ix - Promise or function to wrap
 * @returns Promise<*> -  result of interaction
 * */
export const shallRevert = async (ix) => {
	const wrappedInteraction = promise(ix)
	await expect(wrappedInteraction).rejects.not.toBe(null)

	return wrappedInteraction
}
