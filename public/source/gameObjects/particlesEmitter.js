import MathUtils from "../math_utils.js";
import Animations from "../utils/animations.js";
import Square from "./square.js";

class ParticlesEmitter {
    center = [0,0,0];        
    particlesSpeed = 50;
    particleDeltaPos = [0,0,0];
    timeBeforeDestroy = 5;     
    totParticles = 100; 
        


    emit(objBuilder) {
        let particles = [];        
        for(let i=0; i < this.totParticles; i++)
            particles.push(this.#createParticle(objBuilder));   
        return Promise.all(particles.map(particle => this.#handleParticle(particle)));
    }

    #createParticle(objBuilder) {
        let particle = objBuilder();        
        particle.instatiate();        
        return particle;
    }

    async #handleParticle(particle) {
        let direction = MathUtils.randomVersor();        
        console.log(direction)
        await this.#moveParticle(particle, direction);
        particle.destroy();        
    } 

    async #moveParticle(particle, direction) {       
        // deltaPos = vt * dir 
        const deltaPos = t => MathUtils.mul(t * this.particlesSpeed, direction);    
        await Animations.lerp(t => particle.center = MathUtils.sum(this.center, deltaPos(t)), this.timeBeforeDestroy , 0, this.timeBeforeDestroy);
    }
    
}

export default ParticlesEmitter;