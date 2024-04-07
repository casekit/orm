import { post } from "./models/post.relations";
import { tenant } from "./models/tenant.relations";
import { tenantUser } from "./models/tenantUser.relations";
import { user } from "./models/user.relations";

export const relations = {
    post,
    user,
    tenant,
    tenantUser,
};

export type Relations = typeof relations;
