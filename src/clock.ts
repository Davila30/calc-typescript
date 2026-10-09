export type Observer<T> = (value: T) => void;
export interface Subscription {
	unsubscribe: () => void;
}
export class Observable<T> {
	private readonly start: (observer: Observer<T>) => () => void;
	constructor(start: (observer: Observer<T>) => () => void) {
		this.start = start;
	}
	subscribe(observer: Observer<T>): Subscription {
		return { unsubscribe: this.start(observer) };
	}
}

const formatTime = (date: Date): string => {
	// Mantiene siempre dos dgitos por unidad usa la hora local 
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');

	return `${hours}:${minutes}:${seconds}`;
};

export const clockObservable = new Observable<string>((observer) => {
	const emitTime = (): void => observer(formatTime(new Date()));

	// Publica la hora actualiza cada segundo
	emitTime();
	const intervalId = window.setInterval(emitTime, 1000);

	// Al cancelar la suscripcion, se detiene el temporizador
	return () => window.clearInterval(intervalId);
});

export class ClockComponent {
	private readonly element: HTMLDivElement;
	private subscription: Subscription | null = null;

	constructor() {
		this.element = document.createElement('div');
		this.element.id = 'clock';
		this.element.className = 'clock';
		this.element.textContent = '00:00:00';
		this.element.setAttribute('role', 'timer');
		this.element.setAttribute('aria-label', 'Hora actual');
		this.element.setAttribute('aria-live', 'off');
	}

	getElement(): HTMLDivElement {
		return this.element;
	}

	subscribeToClock(): Subscription {
		// Evita dejar activos si se vuelve a suscribir el componente
		this.subscription?.unsubscribe();
		this.subscription = clockObservable.subscribe((time) => {
			this.element.textContent = time;
		});
		return this.subscription;
	}
}

const formatElapsedTime = (milliseconds: number): string => {
	const elapsedMilliseconds = Math.floor(milliseconds);
	const hours = Math.floor(elapsedMilliseconds / 3_600_000);
	const minutes = Math.floor(elapsedMilliseconds / 60_000) % 60;
	const seconds = Math.floor(elapsedMilliseconds / 1_000) % 60;
	const remainingMilliseconds = elapsedMilliseconds % 1_000;

	return [hours, minutes, seconds]
		.map((unit) => String(unit).padStart(2, '0'))
		.join(':') + `.${String(remainingMilliseconds).padStart(3, '0')}`;
};

export class StopwatchComponent {
	private readonly element: HTMLDivElement;
	private readonly display: HTMLDivElement;
	private readonly startButton: HTMLButtonElement;
	private readonly pauseButton: HTMLButtonElement;
	private elapsedMilliseconds = 0;
	private startedAt: number | null = null;
	private intervalId: number | null = null;

	constructor() {
		this.element = document.createElement('div');
		this.element.className = 'stopwatch';

		this.display = document.createElement('div');
		this.display.className = 'stopwatch-display';
		this.display.textContent = formatElapsedTime(0);
		this.display.setAttribute('role', 'timer');
		this.display.setAttribute('aria-label', 'Tiempo transcurrido');
		this.display.setAttribute('aria-live', 'off');

		const controls = document.createElement('div');
		controls.className = 'stopwatch-controls';

		this.startButton = document.createElement('button');
		this.startButton.type = 'button';
		this.startButton.textContent = 'Iniciar';
		this.startButton.addEventListener('click', () => this.start());

		this.pauseButton = document.createElement('button');
		this.pauseButton.type = 'button';
		this.pauseButton.textContent = 'Pausar';
		this.pauseButton.disabled = true;
		this.pauseButton.addEventListener('click', () => this.pause());

		const resetButton = document.createElement('button');
		resetButton.type = 'button';
		resetButton.textContent = 'Reiniciar';
		resetButton.addEventListener('click', () => this.reset());

		controls.append(this.startButton, this.pauseButton, resetButton);
		this.element.append(this.display, controls);
	}

	getElement(): HTMLDivElement {
		return this.element;
	}

	private render(): void {
		const elapsed = this.elapsedMilliseconds
			+ (this.startedAt === null ? 0 : Date.now() - this.startedAt);
		this.display.textContent = formatElapsedTime(elapsed);
	}

	start(): void {
		if (this.startedAt !== null) return;

		this.startedAt = Date.now();
		this.startButton.disabled = true;
		this.pauseButton.disabled = false;
		this.render();
		this.intervalId = window.setInterval(() => this.render(), 1);
	}

	pause(): void {
		if (this.startedAt === null) return;

		this.elapsedMilliseconds += Date.now() - this.startedAt;
		this.startedAt = null;
		if (this.intervalId !== null) {
			window.clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.startButton.disabled = false;
		this.pauseButton.disabled = true;
		this.render();
	}

	reset(): void {
		this.elapsedMilliseconds = 0;
		this.startedAt = this.startedAt === null ? null : Date.now();
		this.render();
	}
}
