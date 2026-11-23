/** @jsx ReactEcs.createElement */
import ReactEcs, { Button, Label, UiEntity } from '@dcl/sdk/react-ecs'

export interface State {
	speed:				number
	speedText:			string
	gaitText:			string
	slowerDisabled:		boolean
	fasterDisabled:		boolean
}

export const state: State = {
	speed:				10,
	speedText:			'10.0 m/s',
	gaitText:			'Engine: run, run, run. By size: 1x run, 3x walk, 9x walk.',
	slowerDisabled:		false,
	fasterDisabled:		false,
}

const MIN_SPEED	= 0
const MAX_SPEED	= 16
const STEP		= 0.5

type UiAction = { state: State; props: Parameters<typeof SpeedHud>[0]; value?: unknown }


// MARK: snapSpeed
/**
 * Clamps a speed onto the 0.5 m/s steps the buttons use.
 */
function snapSpeed(speed: number): number {
	const steps	= Math.round(speed / STEP)
	const snapped	= steps * STEP

	return Math.min(MAX_SPEED, Math.max(MIN_SPEED, snapped))
}


// MARK: slower
/**
 * Lowers the shared world speed by one step.
 */
/** @ui-action */
function slower({ state }: UiAction) {
	state.speed = snapSpeed(state.speed - STEP)
}


// MARK: faster
/**
 * Raises the shared world speed by one step.
 */
/** @ui-action */
function faster({ state }: UiAction) {
	state.speed = snapSpeed(state.speed + STEP)
}


// MARK: walkSpeed
/**
 * Sets the shared world speed to a walk, 3 m/s.
 */
/** @ui-action */
function walkSpeed({ state }: UiAction) {
	state.speed = 3
}


// MARK: jogSpeed
/**
 * Sets the shared world speed to a jog, 6 m/s.
 */
/** @ui-action */
function jogSpeed({ state }: UiAction) {
	state.speed = 6
}


// MARK: runSpeed
/**
 * Sets the shared world speed to a run, 10 m/s.
 */
/** @ui-action */
function runSpeed({ state }: UiAction) {
	state.speed = 10
}


// MARK: SpeedHud
/**
 * Bottom-centre speed control for the three scaled avatars.
 */
export function SpeedHud(props: { pad?: number }) {
	return (
		<UiEntity
			uiTransform={{
				width: '100%',
				height: '100%',
				flexDirection: 'column',
				justifyContent: 'flex-end',
				alignItems: 'center',
			}}
		>
			<UiEntity
				uiTransform={{
					width: 680,
					height: 248,
					margin: { bottom: 32 },
					padding: 16,
					flexDirection: 'column',
					alignItems: 'center',
					borderRadius: 12,
				}}
				uiBackground={{ color: { r: 0.08, g: 0.09, b: 0.12, a: 0.9 } }}
			>
				<Label
					value="Movement speed"
					fontSize={18}
					textAlign="middle-center"
					textWrap="nowrap"
					color={{ r: 0.8, g: 0.84, b: 0.9, a: 1 }}
					uiTransform={{ width: 640, height: 26 }}
				/>
				<Label
					value={state.speedText}
					fontSize={28}
					textAlign="middle-center"
					textWrap="nowrap"
					color={{ r: 1, g: 0.86, b: 0.45, a: 1 }}
					uiTransform={{ width: 640, height: 36 }}
				/>
				<Label
					value={state.gaitText}
					fontSize={16}
					textAlign="middle-center"
					textWrap="wrap"
					color={{ r: 0.9, g: 0.92, b: 0.95, a: 1 }}
					uiTransform={{ width: 640, height: 44 }}
				/>
				<UiEntity
					uiTransform={{
						width: 400,
						height: 48,
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Button
						value="Slower"
						variant="secondary"
						fontSize={20}
						textWrap="nowrap"
						disabled={state.slowerDisabled}
						uiTransform={{ width: 180, height: 48 }}
						onMouseDown={() => slower({ state, props })}
					/>
					<Button
						value="Faster"
						variant="primary"
						fontSize={20}
						textWrap="nowrap"
						disabled={state.fasterDisabled}
						uiTransform={{ width: 180, height: 48 }}
						onMouseDown={() => faster({ state, props })}
					/>
				</UiEntity>
				<UiEntity
					uiTransform={{
						width: 640,
						height: 48,
						margin: { top: 12 },
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Button
						value="Walk speed"
						variant="secondary"
						fontSize={18}
						textWrap="nowrap"
						uiTransform={{ width: 200, height: 48 }}
						onMouseDown={() => walkSpeed({ state, props })}
					/>
					<Button
						value="Jog speed"
						variant="secondary"
						fontSize={18}
						textWrap="nowrap"
						uiTransform={{ width: 200, height: 48 }}
						onMouseDown={() => jogSpeed({ state, props })}
					/>
					<Button
						value="Run speed"
						variant="secondary"
						fontSize={18}
						textWrap="nowrap"
						uiTransform={{ width: 200, height: 48 }}
						onMouseDown={() => runSpeed({ state, props })}
					/>
				</UiEntity>
			</UiEntity>
		</UiEntity>
	)
}
