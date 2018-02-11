export class utils {
    public static typeName(name: string, types): string {
        if (!name) {
            throw new Error("Invalid formatting of type name");
        }
        for (let k in types) {
            if (!types.hasOwnProperty(k)) continue;
            if (name.toLowerCase() === k.toLowerCase() || name === types[k]) {
                return k.substr(0, 1).toLowerCase() + k.substr(1);
            }
        }
        return name;
    }
}