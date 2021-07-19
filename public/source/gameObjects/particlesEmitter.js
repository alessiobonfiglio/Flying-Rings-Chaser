import MathUtils from "../math_utils.js";
import Animations from "../utils/animations.js";
import Square from "./square.js";

class ParticlesEmitter {
    center = [0,0,0];        
    particlesSpeed = 55;
    particleDeltaPos = [0,0,0];
    timeBeforeDestroy = 5;     
    totParticles = 50; 
        


    emit(objBuilder, onUpdate) {
        let particles = [];        
        for(let i=0; i < this.totParticles; i++)
            particles.push(this.#createParticle(objBuilder));   
        return Promise.all(particles.map(particle => this.#handleParticle(particle, onUpdate)));
    }

    #createParticle(objBuilder) {
        let particle = objBuilder();        
        particle.isVisible = false;                
        particle.instantiate();        
        return particle;
    }

    async #handleParticle(particle, onUpdate) {
        let direction = MathUtils.randomVersor();                
        await this.#moveParticle(particle, direction, onUpdate);
        particle.destroy();        
    } 

    async #moveParticle(particle, direction, onUpdate) {     
        const realSpeed = this.particlesSpeed * MathUtils.getRandomInRange(0.6,1.3);  
        // deltaPos = vt * dir 
        const deltaPos = t => MathUtils.mul(t * realSpeed, direction);    
        await Animations.lerp(t => {            
            particle.center = MathUtils.sum(this.center, deltaPos(Math.log(t + 1)));
            if(onUpdate)
                onUpdate(particle);            
            particle.isVisible = true;
        }, this.timeBeforeDestroy , 0, this.timeBeforeDestroy);
    }
    
}

export default ParticlesEmitter;