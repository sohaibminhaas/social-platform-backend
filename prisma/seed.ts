import { Prisma, Status, Permissions, Admins, Roles, AdminType } from "@prisma/client";
import prismaClient from '../src/db/prisma';
// import { passwordToHash } from "../src/utils/encryption";

const mapPermissions = (permissions: Array<Permissions>) => {
    return permissions.map((permission) => {
        return {
            permission_id: permission.id,
        }
    })
}

const permissionsData: Permissions[] = [
    {
        id: 1,
        title: 'Role',
        status: Status.ACTIVE,
        created_at: new Date(new Date().toISOString()),
        updated_at: null,
    },
    {
        id: 2,
        title: 'Employees',
        status: Status.ACTIVE,
        created_at: new Date(new Date().toISOString()),
        updated_at: null,
    },
    {
        id: 3,
        title: 'Service Providers',
        status: Status.ACTIVE,
        created_at: new Date(new Date().toISOString()),
        updated_at: null,
    },
    {
        id: 4,
        title: 'Users',
        status: Status.ACTIVE,
        created_at: new Date(new Date().toISOString()),
        updated_at: null,
    },
    {
        id: 5,
        title: 'Categories',
        status: Status.ACTIVE,
        created_at: new Date(new Date().toISOString()),
        updated_at: null,
    },
    {
        id: 6,
        title: 'Countries',
        status: Status.ACTIVE,
        created_at: new Date(new Date().toISOString()),
        updated_at: null,
    },
];

const superRole: Roles = {
    id: 1,
    title: 'Super Root User',
    status: Status.ACTIVE,
    created_at: new Date(new Date().toISOString()),
    updated_at: null,
};

const superAdmin: Admins = {
    id: 1,
    firstName: "Super",
    lastName: "Root User",
    email: "super_root_user@yopmail.com",
    phone_no: "+923442723789",
    password: "12345",
    img: null,
    status: Status.ACTIVE,
    created_at: new Date(new Date().toISOString()),
    updated_at: null,
    admin_type: AdminType.SUPER_ROOT
}

async function main() {
    console.log(`Start seeding ...`);
    console.log();

    const permissions = await prismaClient.permissions.createMany({
        data: permissionsData,
        skipDuplicates: true,
    });

    const role = await prismaClient.roles.create({
        data: {
            id: superRole.id,
            title: superRole.title,
            status: superRole.status,
            created_at: superRole.created_at,
            updated_at: superRole.updated_at,
            role_has_permissions: {
                createMany: {
                    data: mapPermissions(permissionsData)
                }
            }
        },
    });

    const admin = await prismaClient.admins.create({
        data: {
            id: superAdmin.id,
            firstName: superAdmin.firstName,
            lastName: superAdmin.lastName,
            email: superAdmin.email,
            phone_no: superAdmin.phone_no,
            status: superAdmin.status,
            password: superAdmin.password,
            img: superAdmin.img,
            created_at: superAdmin.created_at,
            updated_at: superAdmin.updated_at,
            admin_type: superAdmin.admin_type,
            admin_has_roles: {
                create: {
                    role_id: role.id
                }
            }
        }
    })

    console.log(`Seeding finished.`)
}

export default main()
    .then(async () => {
        await prismaClient.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prismaClient.$disconnect()
    })