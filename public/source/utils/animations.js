import MathUtils from "../math_utils.js";

class Animations {
    static nextFramePromise;

    static get #nextFrame() {
		return Animations.nextFramePromise ?? Promise.resolve(0);
	}

    // Animations
	static async lerp(callback, duration, start, end, shouldAbort) {
		shouldAbort ??= () => false;
		let cur = start;		
		var startDuration = duration;
		let [max, min] = [Math.max(start, end), Math.min(start, end)]

		let aborted = shouldAbort();
		while(!aborted && duration > 0) {			
			callback(cur);
			let deltaT = await this.#nextFrame;		
			cur = (duration*start + (startDuration - duration)*end) / startDuration;
			cur = MathUtils.clamp(cur, min, max);
			duration -= deltaT;
			aborted = shouldAbort();
		}		
		if(!aborted)
			callback(end);
	}


	static async lerp3(callback, duration, start, end) {
		let cur = start;		
		var startDuration = duration;		
		while(duration > 0) {			
			callback(cur);
			let deltaT = await this.#nextFrame;		

			cur = MathUtils.mul(1/startDuration, MathUtils.sum(MathUtils.mul(duration, start), MathUtils.mul(startDuration - duration, end)));			
			duration -= deltaT;
		}		
		callback(end);
	}

    
	static async delay(duration){
		await new Promise((resolve, _) => setTimeout(() => resolve(), duration * 1000));
		await this.#nextFrame;
	}
}

export default Animations;