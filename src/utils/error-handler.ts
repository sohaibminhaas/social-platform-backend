export default class Errors {
    constructor() {}

    logger(heading: string, object: any = null) {
        console.log();
        console.info(heading);
        if (object) {
            console.dir(object);
        }
    }

    logError(heading: string, err: any = null) {
        console.log();
        console.info(heading);
        if (err) {
            console.error(err);
        }
    }
}