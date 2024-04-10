import { foo } from "./models/foo.model";
import { post } from "./models/post.model";
import { tenant } from "./models/tenant.model";
import { tenantUser } from "./models/tenantUser.model";
import { user } from "./models/user.model";

export const models = {
    foo,
    post,
    user,
    tenant,
    tenantUser,
};

export type Models = typeof models;
