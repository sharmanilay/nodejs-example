const promiseRetry = require('promise-retry')
const axios = require('axios')

export class Controller {
	constructor() {
		this.updateRemoteApi = this.updateRemoteApi.bind(this)
	}
	// current content: { value: 'old1' }
	static readonly REMOTE_RESOURCE_1_URL =
		'https://6097e897e48ec000178730f9.mockapi.io/api/resource1/1'
	// current content: { value: 'old2' }
	static readonly REMOTE_RESOURCE_2_URL =
		'https://6097e897e48ec000178730f9.mockapi.io/api/resource2/2'

	private _attemptUpdateRemoteAPI = (): Promise<void> => {
		return promiseRetry({ retries: 3 }, async (retry, number) => {
			console.log(`Resource 1 Attempt number ${number}.`)
			if (number <= 2) {
				return retry()
			} else {
				try {
					const prevValue = await axios.get(Controller.REMOTE_RESOURCE_1_URL)
					const result = await axios.put(Controller.REMOTE_RESOURCE_1_URL, {
						value: 'new1'
					})
					console.log('resource 1 updated', result.data)
					return { success: true, prevValue: prevValue.data }
				} catch (err) {
					console.log(err.message)
				}
			}
		}).then((res) => {
			if (res.success) {
				return promiseRetry({ retries: 3 }, async (retry, number) => {
					console.log(`Resource 2 Attempt number ${number}.`)
					if (number <= 2) {
						return retry()
					} else {
						try {
							const result = await axios.put(Controller.REMOTE_RESOURCE_2_URL, {
								value: 'new2'
							})
							console.log('resource 2 updated', result.data)
							return result.data
						} catch (err) {
							console.log('something went wrong, reverting previous changes')
							const { prevValue } = res
							const reverted = await axios.put(
								Controller.REMOTE_RESOURCE_1_URL,
								prevValue
							)
							console.log('reverted changes', reverted.data)
						}
					}
				})
			}
		})
	}

	public updateRemoteApi = (): Promise<void> => {
		return promiseRetry(
			{
				retries: 3
			},
			(retry, number) => {
				if (number <= 2) {
					return retry()
				} else {
					return this._attemptUpdateRemoteAPI()
				}
			}
		)
	}
}
