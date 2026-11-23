import { engine, Transform } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'

import { state } from './ui/SpeedHud'


const X_MIN		= 10
const X_MAX		= 54
const IDLE_AT	= 0.01
const JOG_ABOVE	= 4
const RUN_ABOVE	= 9.5

const LANES = [
	{ name: 'Avatar1x', z: 20 },
	{ name: 'Avatar3x', z: 32 },
	{ name: 'Avatar9x', z: 44 },
]

type Lane = {
	entity:	ReturnType<typeof engine.addEntity>
	z:		number
	scale:	Vector3
}


// MARK: gaitForSpeed
/**
 * Maps a metres-per-second speed onto the desktop Explorer's avatar gait names.
 * Thresholds match RemotePlayerUtils.GetBlendValueFromSpeed: jog above 4, run above 9.5.
 */
function gaitForSpeed(speed: number): string {
	if (speed <= IDLE_AT) return 'idle'
	if (speed > RUN_ABOVE) return 'run'
	if (speed > JOG_ABOVE) return 'jog'

	return 'walk'
}


// MARK: scaleLabel
/**
 * Renders a body scale as "1x" or "2.5x".
 */
function scaleLabel(scale: number): string {
	const rounded = Math.round(scale * 10) / 10

	if (Number.isInteger(rounded)) return `${rounded}x`

	return `${rounded.toFixed(1)}x`
}


// MARK: bodyScale
/**
 * Uniform size of an avatar, from the largest axis of its transform scale.
 */
function bodyScale(scale: Vector3): number {
	return Math.max(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z))
}


// MARK: refreshReadout
/**
 * Writes the speed and the gait comparison into the HUD state.
 */
function refreshReadout(
	speed: number,
	lanes: Lane[]
): void {
	const engineGait	= gaitForSpeed(speed)
	const engineList	= lanes.map(() => engineGait).join(', ')
	const bySize		= lanes.map((lane) => {
		const size		= bodyScale(lane.scale)
		const relative	= size > 0.0001 ? speed / size : speed

		return `${scaleLabel(size)} ${gaitForSpeed(relative)}`
	}).join(', ')

	state.speedText			= `${speed.toFixed(1)} m/s`
	state.gaitText			= `Engine: ${engineList}. By size: ${bySize}.`
	state.slowerDisabled	= speed <= 0
	state.fasterDisabled	= speed >= 16
}


// MARK: placeLane
/**
 * Puts one avatar on the shared east-west position and its own north-south lane.
 */
function placeLane(
	lane: Lane,
	x: number
): void {
	const transform = Transform.getMutable(lane.entity)

	transform.position.x	= x
	transform.position.y	= 0
	transform.position.z	= lane.z
	transform.scale			= lane.scale
}


// MARK: startScaledAvatars
/**
 * Ping-pongs the scaled avatar entities across the scene at the HUD speed.
 * All three share one x, so they stay in a straight line while spaced on z.
 */
export function startScaledAvatars(): void {
	const lanes: Lane[] = []

	for (const lane of LANES) {
		const entity = engine.getEntityOrNullByName(lane.name)

		if (entity === null) {
			console.log(`AvatarLanes: startScaledAvatars: missing entity ${lane.name}`)
			continue
		}

		const current = Transform.get(entity).scale

		lanes.push({
			entity:	entity,
			z:		lane.z,
			scale:	Vector3.create(current.x, current.y, current.z),
		})
	}

	let x				= (X_MIN + X_MAX) / 2
	let direction		= 1
	let appliedSpeed	= Number.NaN

	engine.addSystem((dt: number) => {
		const speed = state.speed

		x += direction * speed * dt

		if (x >= X_MAX) {
			x			= X_MAX
			direction	= -1
		} else if (x <= X_MIN) {
			x			= X_MIN
			direction	= 1
		}

		for (const lane of lanes) placeLane(lane, x)

		if (speed !== appliedSpeed) {
			appliedSpeed = speed
			refreshReadout(speed, lanes)
		}
	})

	console.log(`AvatarLanes: startScaledAvatars: driving ${lanes.length} avatars`)
}
