import Router from '../router';





// TODO: doc... validate subjects... what formats are allowed?
export default function allow(subjects: string) {
    return (classProto: any, propertyKey: string) => {



        let permissions: Clearance[] = classProto[PERMISSIONS_TAG] || (classProto[PERMISSIONS_TAG] = []);
        permissions.push({
            clearanceMask,
            intentionMask: propertyKey,
            allow: true,
        });
    };
}
Router.prototype;