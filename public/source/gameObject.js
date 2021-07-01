class GameObject 
{
    // Property position = pivot world coordinates
    #position = [0,0]
    get position(){
        return this.#position;
    }

    set position(value){
        if(!value[0] || !value[1])
            throw new Error("Position must me an array");
        this.#position = value;
    }
    

    getVertices()
    {
        var positions = [
            -1, -1,
            -1, -0.5,
            -0.3, -1,
        ];
        for(var i=0; i < positions.length; i+=2)
            [positions[i], positions[i+1]] = this.#sum(this.position, [positions[i], positions[i+1]]); // translate by position 
        return positions;
    }

    #sum(a, b)
    {
        return [a[0] + b[0], a[1] + b[1]];
    }
}

export default GameObject;