import { startScaledAvatars } from './avatar-lanes'
import { setupUi } from './ui'



// MARK: main
/**
 * Starts the speed HUD and the three scaled avatars.
 */
export function main() {
	setupUi()
	startScaledAvatars()
}
