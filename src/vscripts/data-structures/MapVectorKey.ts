export class MapVectorKey<ValueType> extends Map<number, ValueType>
{
    get(key: Vector)
    {
        if(!key) return undefined;
        if(type(key) === "number") return super.get(key);
        return super.get(this.hashFunction(key));
    }

    delete(key: Vector)
    {
        if(!key) return false;
        if(type(key) === "number") return super.delete(key);
        return super.delete(this.hashFunction(key));
    }

    has(key: Vector)
    {
        if(!key) return false;
        if(type(key) === "number") return super.has(key);
        return super.has(this.hashFunction(key));
    }

    set(key: Vector, value: ValueType)
    {
        if(!key) return this;
        if(type(key) === "number") return super.set(key, value);
        super.set(this.hashFunction(key), value);
        return this;
    }

    private hashFunction(x: Vector)
    {
        let hash = 23;
        hash += (hash * 37) + x.x;
        hash += (hash * 37) + x.y;
        hash += (hash * 37) + x.z;
        return hash;
    }
}
