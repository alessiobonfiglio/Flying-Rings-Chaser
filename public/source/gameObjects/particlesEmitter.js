import MathUtils from "../math_utils.js";
import Animations from "../utils/animations.js";
import Square from "./square.js";

class ParticlesEmitter {
    center = [0,0,0];        
    particlesSpeed = 25;
    particleDeltaPos = [0,0,0];
    timeBeforeDestroy = 5;     
    totParticles = 100; 
        


    emit(objBuilder, onUpdate) {
        let particles = [];        
        for(let i=0; i < this.totParticles; i++)
            particles.push(this.#createParticle(objBuilder));   
        return Promise.all(particles.map(particle => this.#handleParticle(particle, onUpdate)));
    }

    #createParticle(objBuilder) {
        let particle = objBuilder();        
        particle.instatiate();        
        return particle;
    }

    async #handleParticle(particle, onUpdate) {
        let direction = MathUtils.randomVersor();                
        await this.#moveParticle(particle, direction, onUpdate);
        particle.destroy();        
    } 

    async #moveParticle(particle, direction, onUpdate) {       
        // deltaPos = vt * dir 
        const deltaPos = t => MathUtils.mul(t * this.particlesSpeed, direction);    
        await Animations.lerp(t => {
            particle.center = MathUtils.sum(this.center, deltaPos(t))
            onUpdate(particle);
        }, this.timeBeforeDestroy , 0, this.timeBeforeDestroy);
    }
    
}

export default ParticlesEmitter;