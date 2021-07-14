import MathUtils from "../math_utils.js";

class Animations {
    static nextFramePromise;

    static get nextFrame() {
		return Animations.nextFramePromise ?? new Promise(resolve => requestAnimationFrame(() => resolve (1/60)));
	}

    // Animations
	static async lerp(callback, duration, start, end, shouldAbort) {
		shouldAbort ??= () => false;
		let cur = start;		
		const startDuration = duration;
		const [max, min] = [Math.max(start, end), Math.min(start, end)]

		let aborted = shouldAbort();
		while(!aborted && duration > 0) {			
			callback(cur);
			const deltaT = await this.nextFrame;
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
		const startDuration = duration;
		while(duration > 0) {			
			callback(cur);
			const deltaT = await this.nextFrame;

			cur = MathUtils.mul(1/startDuration, MathUtils.sum(MathUtils.mul(duration, start), MathUtils.mul(startDuration - duration, end)));			
			duration -= deltaT;
		}		
		callback(end);
	}

    
	static async delay(duration, cancelCondition){
		cancelCondition ??= (() => false);
		for(; duration >= 0 && !cancelCondition(); duration -= await this.nextFrame)
			;
		
	}
}

export default Animations;